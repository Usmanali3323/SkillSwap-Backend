import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  RoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  text: {
    type: String,
    trim: true,
  },
    fileUrl: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    trim: true
  },
  isFile:{
  type: Boolean,
  default:false
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);
