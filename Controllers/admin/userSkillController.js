
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Skill } from "../../Models/Skill.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { Room } from "../../Models/room.js";
import Review from "../../Models/review.model.js";

export const userSkillController = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch skills where this user is the provider
    const userSkills = await Skill.find({ providerId: userId,isVerify:true}).populate("categoryId providerId review");

    if (userSkills.length === 0) {
      return res.status(200).json(new ApiResponse(200,userSkills, "No skills found for this user"));
    }

    res.status(200).json(
      new ApiResponse(200, userSkills, "User skills fetched successfully")
    );
  } catch (error) {
    console.error("UserSkillController Error:", error);
    res.status(error.statusCode || 500).json(
      new ApiError(
        error.statusCode,
        error.error,
        error.message
      )
    );
  }
};



export const deleteSkillController = async (req, res) => {
  try {
    const { skillId } = req.params;

    // 1. Check if skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found", 
      });
    }
   if(skillId.isVerify){
    // 2. Delete all reviews linked to this skill
    await Review.deleteMany({ skillId });

    // 3. Delete all chat rooms linked to this skill
    await Room.deleteMany({ skillId });
   }
    // 4. Delete the skill itself
    await Skill.findByIdAndDelete(skillId);

    res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




 
export const verifySkillController = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    const { isVerify } = req.body;
    let updated;

    // Validation
    if (typeof isVerify !== "boolean") {
      throw new ApiError(400, {}, "Body field `isVerify` must be boolean");
    }
    if(isVerify==false){
     const deleteSkill = await Skill.findByIdAndDelete(skillId);
    }else{
    updated = await Skill.findByIdAndUpdate(
      skillId,
      { isVerify },
      { new: true }
    ).populate("providerId", "-password -refreshToken");
    if (!updated) {
      return res
        .status(404)
        .json(new ApiError(404, {}, "Skill not found"));
    }
      const newRoom = await Room.create({
        skillId: skillId,
        members:[{user:updated.providerId._id,role:"admin"}]
      });
  }
    const message = isVerify
      ? "Skill approved successfully"
      : "Skill marked as unverified";

    return res
      .status(200)
      .json(new ApiResponse(200, updated, message));
  } catch (err) {
    console.error("Error in verifySkillController:", err);
    next(err);
  }
};


/**
 * GET /admin/skill-requests
 * Returns all skills where isVerify === false
 * Restricted to admins.
 */
export const getAllSkillRequestsController = async (req, res, next) => {
  try {
    // Fetch all unverified skills
    const pendingSkills = await Skill.find({ isVerify: false })
      .populate("providerId", "-password -refreshToken")
      .populate("categoryId", "name");

    return res
      .status(200)
      .json(new ApiResponse(200, pendingSkills, "Fetched skill requests successfully"));
  } catch (err) {
    console.error("Error in getAllSkillRequestsController:", err);
    next(err);
  }
};
