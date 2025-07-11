import { Message } from "../../Models/message.js";
import { Room } from "../../Models/room.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";


export const getMessagesBySkillId = async (req, res) => {
  try {
    const skillId = req.params.skillId;
    
    const room = await Room.findOne({skillId});
  
    
    const messages = await Message.find({RoomId: room?._id})
      .populate("senderId", "fullName email profileImage")
      .populate("receiverId", "fullName email profileImage")
      .populate("RoomId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving messages",
    });
  }
};
