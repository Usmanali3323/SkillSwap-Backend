
import User from "../../../Models/user.model.js";
import { ApiError } from "../../../utils/ApiError.js";
import { deleteCloudinaryFile, uploadCloudinary } from "../../../utils/cloudinary.js";

// @desc    Update user profile
// @route   PUT /api/v1/user/profile
// @access  Private (Authenticated user only)
export const updateUserProfileController = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(401, {}, "Unauthorized access");
    }

    const { fullName, bio, designation } = req.body;
    
   let profileImageUrl = "";

    // ✅ Upload image if available
    console.log("working inside update profile");
    
    const profileImage = req?.files?.profileImage?.[0];
    
    if (profileImage?.path) {
      const uploaded = await uploadCloudinary(profileImage.path, "skillswap/skills");
    
      profileImageUrl = uploaded.secure_url;
    }
    const updatedData = {};
    if (fullName) updatedData.fullName = fullName;
    if (bio) updatedData.bio = bio;
    if (profileImageUrl) updatedData.profileImage = profileImageUrl;
    if (designation)  updatedData.designation = designation;
    
    const getProfileImageUrl = await User.findById(userId).select("profileImage");
    console.log(getProfileImageUrl);
    
    if(!getProfileImageUrl.profileImage==''){
    let deleteProfileImage = await deleteCloudinaryFile(getProfileImageUrl.profileImage);
    console.log(getProfileImageUrl.profileImage,"profileImage");
    
    console.log(deleteProfileImage,"delete Profile Image");
    
    if(!deleteProfileImage.result == "ok"){
      throw new ApiError(400,{},"Error Removing Image at Cloudinary")
    }
     }
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
      runValidators: true,
    }).select("fullName bio skillTags profileImage designation");

    if (!updatedUser) {
      throw new ApiError(404, {}, "User not found");
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.json(new ApiError(error.statusCode,error.error,error.message))   
  }
};


