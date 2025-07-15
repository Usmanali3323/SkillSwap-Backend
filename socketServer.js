import dotenv from 'dotenv'
import { Server } from "socket.io";
import http from 'http'
import { Message } from "./Models/message.js";
import { Room } from "./Models/room.js";
import express from 'express'
import DbConn from './db/DbConn.js';
import { upload } from './Middleware/multer.middleware.js';
import { uploadCloudinary } from './utils/cloudinary.js';
import path from 'path';
import fs from 'fs'
import User from './Models/user.model.js';

dotenv.config({ path: "./.env" });

DbConn();

const app=express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const userSocketMap = new Map();

io.on("connection", (socket) => {
  console.log("🟢 New connection:", socket.id);

  socket.on("register-user", (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  socket.on("create-room", async ({ skillId }) => {
    try {
      let room = await Room.findOne({ skillId });

      if (room) {
        socket.join(room._id.toString());
        socket.emit("room-created", { room, existed: true });
        return;
      }

      room = await Room.create({ skillId });
      socket.join(room._id.toString());
      socket.emit("room-created", { room, existed: false });

      console.log(`Room created and joined: ${room._id}`);
    } catch (err) {
      console.error("❌ create-room error:", err.message);
      socket.emit("room-error", { error: "Failed to create room" });
    }
  });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on("send-group-message", async ({ roomId, senderId, text }) => {
    try {
      console.log("send message group");
      console.log(text);
      
      const newMessage = await Message.create({
        RoomId: roomId,
        senderId,
        text
      });
const savedMessage = await newMessage.save();
const populatedMessage = await savedMessage.populate('senderId');

      io.to(roomId).emit("receive-group-message", {
        ...populatedMessage.toObject(),
        text: populatedMessage.text, 
      });
    } catch (err) {
      console.error("❌ send-group-message error:", err.message);
    }
  });

   
socket.on('upload', async (data) => {
    try {
     console.log("upload file request come  !! ")
      const { buffer, fileName, roomId , senderId } = data;

      // Save file temporarily to disk
      const tempPath = path.join('public', `${Date.now()}-${fileName}`);
      fs.writeFileSync(tempPath, Buffer.from(buffer));
      console.log("temPath : ", tempPath);
      
      // Upload to Cloudinary
      const uploadResult = await uploadCloudinary(tempPath);
      if(uploadResult){
     const saveFile =await Message.create({
        RoomId:roomId,
        senderId,
        fileUrl:uploadResult.secure_url,
        fileName:uploadResult?.original_filename,
        isFile:true
      })
     saveFile.save()
    console.log("saveFile : ",saveFile );  
     console.log("uploader successful : ",uploadResult);  
  }
      

      // Delete temp file
      if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

      const messageData = {
        roomId,
        text: uploadResult.secure_url,
        isFile: true,
        createdAt: new Date(),
        senderId: senderId,
      };

      // Broadcast file message
      io.to(roomId).emit('uploaded-success', true);

    } catch (error) {
      console.error('Error in file upload:', error);
    }
  });



  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });
});

server.listen(3000)
