import { Connection } from "../../Models/connection.model.js";
import Review from "../../Models/review.model.js";
import { Room } from "../../Models/room.js";
import { Skill } from "../../Models/Skill.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadCloudinary } from "../../utils/cloudinary.js";


export const addSkillController = async (req, res, next) => {
  try {
    const {
      title,
      description,
      categoryId,
      tags,
      level,
      availability,
      location,
      mode,
    } = req.body;


    // ✅ Validate required fields
    if (!title || !categoryId || !mode) {
      throw new ApiError(400,{}, "Title, Category and Mode are required")
    }

    // ✅ Initialize variable for uploaded image URL

    let coverImageUrl = "";

    // ✅ Upload image if available
    const coverImage = req?.files?.coverImage?.[0];
    if (coverImage?.path) {
      const uploaded = await uploadCloudinary(coverImage.path, "skillswap/skills");
      coverImageUrl = uploaded.secure_url;
    }

    // ✅ Create skill
    const newSkill = await Skill.create({
      title,
      description,
      categoryId,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
      level,
      availability,
      location,
      isActive:true,
      mode,
      imagesUrl: coverImageUrl ? [coverImageUrl] : [],
      providerId: req.user._id, // assuming auth middleware adds user to req
    });


    return res.status(201).json(new ApiResponse(201,newSkill,"Skill Request successfully"))
  } catch (error) {
    console.error("Error in addSkillController:", error);
    return res.json(new ApiError(error.statusCode,error.error,error.message));
  }
};


export const getUserSkillsController = async (req, res, next) => {
  try {
    const userId = req.user._id; // assuming auth middleware sets this

    const userSkills = await Skill.find({providerId:userId,isVerify:true}).populate('providerId','-password -resetPasswordExpires -resetPasswordToken -refreshToken')
console.log(userSkills,"userSkill");

    return res.status(200).json( new ApiResponse(200,userSkills,"User skills fetched successfully"))
  } catch (error) {
    console.error("Error in getUserSkillsController:", error);
   res.json(new ApiError(error.statusCode,error.error,error.message));
  }
};

export const getAllSkillController = async (req, res) => {
  try {
    // Populate both providerId and full review details
    const {userId} = req.params;
    let skills;
    if(userId){
      const joinedSkill = await Room.find({ "members.user": userId });
      const requestSkill = await Connection.find({requesterId:userId});
      const requestSkillId = requestSkill.map(s=>s.skillId);
      const skillIds = joinedSkill.map(s => s.skillId);
      const mergeSkillId = [...skillIds,...requestSkillId];
      skills = await Skill.find({ _id: { $nin: mergeSkillId } })
      .populate("providerId", "-password -refreshToken")
      .populate({
        path: "review",
        populate: {
          path: "senderId",
          select: "fullName profileImage"
        }
      });
    }else{
      skills = await Skill.find({isVerify:true})
      .populate("providerId", "-password -refreshToken")
      .populate({
        path: "review",
        populate: {
          path: "senderId",
          select: "fullName profileImage"
        }
      });
    }

    // Map through each skill and compute average rating
    const updatedSkills = skills.map(skill => {
      const ratings = skill.review?.map(r => r.rating) || [];
      const averageRating = ratings.length
        ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
        : 0;

      return {
        ...skill.toObject(),
        averageRating: Number(averageRating),
        review: skill.review // include full review array
      };
    });

    res.json(new ApiResponse(200, updatedSkills, "Fetched all skills successfully"));
  } catch (error) {
    res.status(500).json(
      new ApiError(error.statusCode || 500, error, error.message)
    );
  }
};


export const getSkillsByUserController = async(req,res)=>{
  try {
    const {providerId} = req.params; 
   const providerSkill = await Skill.find({providerId,isVerify:true})
   if(!providerSkill)
   return res.json(new ApiResponse(200,{},"No Skill Found"));  
  return res.json(new ApiResponse(200,providerSkill,"fetch Skill Successfully"));  
  } catch (error) {
     res.json(new ApiError(error.statusCode,error.error,error.message))
  }
}



export const getUsersEnrolledInSkillController = async (req, res) => {
  try {
    const { userId } = req.params;

    const rooms = await Room.find({ "members.user": userId })

    if (!rooms || rooms.length === 0) {
      return res
        .status(200)
        .json(new ApiError(200, {}, "User is not enrolled in any skill"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, rooms, "Fetched enrolled skills successfully"));
  } catch (error) {
    console.error("Error fetching enrolled skills:", error);
    return res.status(500).json(new ApiError(error.statusCode,error.error,error.message));
  }
};



export const JoinSkillController = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find joined and created skills
    const joinedRooms = await Room.find({
      members: { $elemMatch: { user: userId, role: "user" } },
    });

    const createdRooms = await Room.find({
      members: { $elemMatch: { user: userId, role: "admin" } },
    });

    const joineSkills = joinedRooms.length;
    const createdSkills = createdRooms.length;

    return res.json(
      new ApiResponse(
        200,
        { joineSkills, createdSkills },
        joineSkills + createdSkills === 0
          ? "No community joined yet!"
          : "Communities found"
      )
    );
  } catch (error) {
    return res.status(500).json(
      new ApiError(
        error.statusCode ,
        error,
        error.message 
      )
    );
  }
};





export const getSkillByIdController = async (req, res) => {
  try {
    const skillId = req.params.skillId;

    const skill = await Skill.findById(skillId)
      .populate('categoryId', 'name') // only get category name
      .populate('providerId', '-password -refreshToken -resetPasswordToken -resetPasswordExpires') // exclude sensitive fields
      .populate('review');

    if (!skill) {
      return res.status(404).json(new ApiResponse(404, null, "Skill not found"));
    }

    // Calculate average rating
    const ratings = skill.review?.map(r => r.rating) || [];
    const averageRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
      : 0;

    const skillWithRating = {
      ...skill.toObject(),
      averageRating: Number(averageRating),
    };

    return res.status(200).json(new ApiResponse(200, skillWithRating, "Skill fetched successfully"));
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, err, err.message || "Server error"));
  }
};


export const SkillApprovalRequestByUserController = async (req, res) => {
  try {
    const userId = req.params.userId;

    const skill = await Skill.find({providerId:userId})
      .populate('categoryId', 'name') // only get category name
      .populate('providerId', '-password -refreshToken -resetPasswordToken -resetPasswordExpires') // exclude sensitive fields
      .populate('review');

    if (!skill) {
      return res.status(200).json(new ApiResponse(200, null, "No Skill Request Found"));
    }
    return res.status(200).json(new ApiResponse(200, skill, "Skill Approval Request fetched successfully"));
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ApiError(500, err, err.message || "Server error"));
  }
};
