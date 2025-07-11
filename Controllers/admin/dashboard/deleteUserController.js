
import { Connection } from "../../../Models/connection.model.js";
import Review from "../../../Models/review.model.js";
import { Room } from "../../../Models/room.js";
import { Skill } from "../../../Models/Skill.model.js";
import User from "../../../Models/user.model.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
// ✅ Import your Room model


export const deleteUserController = async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. Find the user
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // 2. Get all skills provided by the user
    const skills = await Skill.find({ providerId: userId });
    const skillIds = skills.map(skill => skill._id);

    // 3. Delete all related rooms using those skill IDs
    await Room.deleteMany({ skillId: { $in: skillIds } });

    // 4. Delete skills provided by the user
    await Skill.deleteMany({ providerId: userId });

    // 5. Delete all connections involving the user
    await Connection.deleteMany({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    // 6. Delete all reviews made by the user
    await Review.deleteMany({ senderId: userId });

    // 7. Delete the user
    await User.findByIdAndDelete(userId);

    // 8. Respond with success
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User and all related data deleted successfully"));
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(error.statusCode || 500).json(
      new ApiError(
        error.statusCode || 500,
        error.message || "Failed to delete user"
      )
    );
  }
};
