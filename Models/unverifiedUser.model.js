import mongoose from "mongoose";

const unverifiedUserSchema = new mongoose.Schema(
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
    OTP:String,
    otpexpiry:{
      type:Date
    },
    createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // ⏰ 300 seconds = 5 minutes
  }
 }
);
const UnverifiedUser = mongoose.model("Unverifieduser", unverifiedUserSchema);


export default UnverifiedUser;
