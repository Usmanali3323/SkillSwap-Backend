import jwt from "jsonwebtoken";
import User from "../Models/user.model.js";
import { ApiError } from "../utils/ApiError.js"; // You missed importing this!
import { generateAccessTokenAndRefereshToken } from "../utils/generateToken.js";



export const isAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      throw new ApiError(403,{}, "Access denied: Admins only");
    }
    next();
  } catch (error) {
    return res.status(error.statusCode || 500).json(new ApiError(error.statusCode,error.error,error.message || "Admin access error"));
  }
};


const verifyUser = async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      throw new ApiError(401, {}, "Unauthorized access - no access token");
    }

    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
    } catch (err) {
      // Access token invalid or expired, attempt to use refresh token
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw new ApiError(403, {}, "Refresh token missing or expired");
      }

      const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
      const user = await User.findById(decodedRefresh._id);
      if (!user || refreshToken !== user.refreshToken) {
        throw new ApiError(403, {}, "Invalid refresh token or user not found");
      }

      // Update activity & re-authenticate
      user.isActive = true;
      user.lastActiveAt = new Date();

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await generateAccessTokenAndRefereshToken(user._id);

      user.refreshToken = newRefreshToken;
      await user.save();

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      };

      res.cookie("accessToken", newAccessToken, options);
      res.cookie("refreshToken", newRefreshToken, options);

      req.user = user;
      return next();
    }

    // Access token is valid — check if still active
    const user = await User.findById(decoded._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, {}, "User not found");
    }

    // Check if more than 2 hours have passed since last activity
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    if (
      user.isActive &&
      user.lastActiveAt &&
      Date.now() - new Date(user.lastActiveAt).getTime() > TWO_HOURS
    ) {
      user.isActive = false;
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };
    res
      .status(error.statusCode || 401)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiError(error.statusCode || 401, error, error.message));
  }
};

export { verifyUser };
