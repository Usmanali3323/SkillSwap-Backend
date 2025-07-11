
import User from "../../../Models/user.model.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";


export const viewAllUserController = async (req, res) => {
  try {
    // Get all users excluding their passwords
    const users = await User.find({role:"user"}).select("-password");

    res.status(200).json(new ApiResponse(200,users,"All users fetched successfully"));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json(new ApiError(error.statusCode,error.error.error.message));
  }
};
