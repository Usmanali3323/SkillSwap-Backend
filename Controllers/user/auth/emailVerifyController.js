import UnverifiedUser from "../../../Models/unverifiedUser.model.js";
import User from "../../../Models/user.model.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { generateAccessTokenAndRefereshToken } from "../../../utils/generateToken.js";


export const verifiedAccountController = async (req, res, next) => {
  try {
    const { email, OTP } = req.body;

    if (!email || !OTP) {
      throw new ApiError(400, {}, "Email and OTP are required");
    }

    const unverifiedUser = await UnverifiedUser.findOne({ email, OTP });

    if (!unverifiedUser) {
      throw new ApiError(400, {}, "Incorrect or expired OTP");
    }

    const { fullName, password } = unverifiedUser;

    // Create verified user
    const createdUser = await User.create({ 
      fullName,
      email,
      password,isActive : true,
      lastActiveAt : new Date()});
    if (!createdUser) {
      throw new ApiError(500, {}, "Error during registration");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessTokenAndRefereshToken({
      _id: createdUser._id,
    });

    // Save refreshToken
    createdUser.refreshToken = refreshToken;
    await createdUser.save();

    // Delete unverified user
    await UnverifiedUser.deleteOne({ _id: unverifiedUser._id });

    // Prepare user data (sanitize)
    const userSafeData = createdUser.toObject();
    delete userSafeData.password;
    delete userSafeData.refreshToken;
    delete userSafeData.resetPasswordToken;
    delete userSafeData.resetPasswordExpires;

    req.user = createdUser;

    // Set secure cookies
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Make sure you're using HTTPS in production
      sameSite: "None",
    };

    const responseData = {
      user: userSafeData,
      accessToken,
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(201, responseData, "Registered successfully"));

  } catch (error) {
    return res.status(error.statusCode || 500).json(
      new ApiError(error.statusCode || 500, error.error || {}, error.message || "Internal Server Error")
    );
  }
};
