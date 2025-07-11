import { Message } from "../../Models/message.js";
import { Room } from "../../Models/room.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const getRoomcontroller = async(req,res)=>{
  try {
    const {userId}  = req.params;
    const room = await Room.find({"members.user":userId}).populate("skillId");
    if(!room){
        throw new ApiError(404,{},"no room found");
    }
    res.status(200).json(new ApiResponse(200,room,"Room Fetch successfully !! "))
  } catch (error) {
    res.json(new ApiError(error.statusCode,error.error,error.message));
  }  
}

export const getChatController = async(req,res)=>{
    try {
        let {roomId,limit} = req.body;
      limit =limit || 50;
        if(!roomId){
            throw new ApiError(404,{},"RoomId is required !!")
        }
        const messages = await Message.find({RoomId: roomId })
  .sort({ createdAt: -1 }) // Sort by newest first
  .populate("senderId")  
  .limit(limit)             // Limit to 50 messages
  .lean();                 // Optional: improves performance if no Mongoose methods needed

// Optional: reverse to show oldest at top if you're displaying in that order
const recentMessages = messages.reverse();

res.json(new ApiResponse(200,recentMessages,"Reterive Messages successfully"))
    } catch (error) {
        res.json(new ApiError(error.statusCode,error.error,error.message));
    }
}

export const getAllMemberOfRoomcontroller = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Check if the requesting user is admin or moderate
    const checkUser = await Room.findOne({
      _id: roomId,
      members: {
        $elemMatch: {
          user: req?.user?._id,
          role: { $in: ['admin', 'moderate'] }
        }
      }
    });

    if (!checkUser) {
      throw new ApiError(401, {}, "User must be group admin or moderator");
    }

    // Populate members if they are referenced
    const roomMembers = await Room.findById(roomId).populate('members.user');

    res
      .status(200)
      .json(new ApiResponse(200, roomMembers.members, "Members fetched successfully"));
  } catch (error) {
    res.status(error.statusCode || 500).json(
       new ApiError(error.statusCode, error.error, error.message)
    );
  }
};



export const removeRoomMemberController = async (req, res) => {
  try {
    const { roomId, memberId, adminId } = req.body;

    if (!roomId || !memberId || !adminId) {
      throw new ApiError(400, {}, "All fields (roomId, memberId, adminId) are required");
    }

    // Check if adminId is an admin or moderate in that room
    const checkAdminId = await Room.findOne({
      _id: roomId,
      members: {
        $elemMatch: {
          user: adminId,
          role: { $in: ['admin', 'moderate'] }
        }
      }
    });

    if (!checkAdminId) {
      throw new ApiError(401, {}, "User must be admin or moderate");
    }

    // Check if the member exists in the room
    const isUserExist = await Room.findOne({
      _id: roomId,
      members: {
        $elemMatch: {
          _id:memberId
        }
      }
    });
    
    if (!isUserExist) {
      throw new ApiError(404, {}, "Member not found in the room");
    }
    if(isUserExist.members.role == 'admin'){
      throw new ApiError(400,{},"you can't remove admin")
    }
    if(checkAdminId=='moderate' && isUserExist=='moderate'){
      throw new ApiError(400,{},"you can't delete moderate")
    }
    // Remove the member from the room
    const updatedRoom = await Room.findOneAndUpdate(
      { _id: roomId },
      { $pull: { members: { _id: memberId } } },
      { new: true }
    );
    

    res.status(200).json(new ApiResponse(200, updatedRoom, "Member removed successfully"));
  } catch (error) {
    res.status(error.statusCode).json(
      new ApiError(error.statusCode, error.error, error.message)
    );
  }
};


export const changeRoomPermissionController = async (req, res) => {
  try {
    const { roomId, permission } = req.body;

    if (!roomId) {
      throw new ApiError(400, {}, "roomId is required");
    }

    // Check if user is admin or moderate
    const isAdminUser = await Room.findOne({
      _id: roomId,
      members: {
        $elemMatch: {
          user: req?.user?._id,
          role: { $in: ['admin', 'moderate'] }
        }
      }
    });

    if (!isAdminUser) {
      throw new ApiError(403, {}, "Only admins or moderators can change permissions");
    }

    // Update permission field
    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { permission },
      { new: true }
    );

    res.status(200).json(
      new ApiResponse(200, updatedRoom, "Permission updated successfully")
    );
  } catch (error) {
    res.status(error.statusCode || 500).json(
      new ApiError(
        error.statusCode,
        error.error,
        error.message 
      )
    );
  }
};


export const changeUserRoleController = async (req, res) => {
console.log(JSON.stringify(req.body));

  
  const { roomId, newRole, adminId, memberId } = req.body;

  try {
    // ✅ Validate required fields
    if (!roomId || !newRole || !adminId || !memberId) {
      throw new ApiError(400, {}, "All fields (roomId, newRole, adminId, memberId) are required.");
    }

    // ✅ Prevent admin from demoting themselves
    if (memberId === adminId) {
      throw new ApiError(401, {}, "Admin can't change their own role.");
    }
   const changeRole =  await Room.find({
  _id: roomId,
  "members.user": memberId,
})

console.log(changeRole,"change role");


    // ✅ Check if the adminId is actually an admin of this room
    const isAdminUser = await Room.findOne({
      _id: roomId,
      members: {
        $elemMatch: {
          user: adminId,
          role: 'admin',
        },
      },
    });

    if (!isAdminUser) {
      throw new ApiError(403, {}, "Only admins can change user roles.");
    }

    // ✅ Update the role of the target member (memberId)
    const updatedRoom = await Room.findOneAndUpdate(
      {
        _id: roomId,
        "members.user": memberId,
      },
      {
        $set: {
          "members.$.role": newRole,
        },
      },
      { new: true }
    );

    if (!updatedRoom) {
      throw new ApiError(404, {}, "Room or member not found.");
    }

    res.status(200).json(
      new ApiResponse(200, updatedRoom, "User role updated successfully.")
    );

  } catch (error) {
    res.status(error.statusCode || 500).json(
      new ApiError(
        error.statusCode || 500,
        error.error || {},
        error.message || "Internal Server Error"
      )
    );
  }
};



export const leftCommunityByUserController = async (req, res) => {
  const { roomId, userId } = req.body;

  try {
    if (!roomId || !userId) {
      throw new ApiError(400, {}, "roomId and userId are required");
    }

    // Remove the user from the room's members array
    const updatedRoom = await Room.findOneAndUpdate(
      {
        _id: roomId,
        "members.user": userId,
      },
      {
        $pull: {
          members: { user: userId },
        },
      },
      { new: true }
    );

    if (!updatedRoom) {
      throw new ApiError(404, {}, "Room or user not found.");
    }

    return res.status(200).json(
      new ApiResponse(200, updatedRoom, "Successfully left the community.")
    );
  } catch (error) {
    return res.status(error.statusCode || 500).json(
      new ApiError(
        error.statusCode,
        error.error ,
        error.message
      )
    );
  }
};
