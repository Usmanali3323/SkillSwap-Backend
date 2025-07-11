import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    designation: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  isActive: { type: Boolean, default: false },
  lastActiveAt: { type: Date, default: null },

   refreshToken:String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
     resetPasswordToken: { type: String, default: null },
     resetPasswordExpires: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Optional: method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isPasswordCorrect = async function(password){
let checkPassword = await bcrypt.compare(password,this.password);
if(!checkPassword){
  new ApiError(401,{},"incorrect password");
}

return checkPassword;
}

userSchema.methods.generateAccessToken = function(ACCESS_TOKEN_EXPIRY){
    return JWT.sign(
    {
    _id: this._id,
    username: this.username,
    email: this.email,
    fullName: this.fullName
    },
    process.env.ACCESS_TOKEN,
    {expiresIn:ACCESS_TOKEN_EXPIRY}
    );
}

userSchema.methods.generateRefreshToken = function(REFRESH_TOKEN_EXPIRY){
    return JWT.sign(
    {
    _id: this._id,
    },
    process.env.REFRESH_TOKEN,
    {expiresIn:REFRESH_TOKEN_EXPIRY}
    );
}

const User = mongoose.model("User", userSchema);

export default User;
