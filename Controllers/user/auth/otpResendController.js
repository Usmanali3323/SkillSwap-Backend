import UnverifiedUser from "../../../Models/unverifiedUser.model.js";
import User from "../../../Models/user.model.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import sendEmail from "../../../utils/sendEmail.js";

export const resendOtpController = async (req,res)=>{
try {
  const {email} = req.body;
  if(!email){
    throw new ApiError(404,{},"Email must required")
  }
  const checkUser = await UnverifiedUser.findOne({email});
  if(!checkUser){
    throw new ApiError("User doesn't Exist signup again")
  }
  const OTP = Math.floor(100000 + Math.random() * 900000).toString();

  await sendEmail(
    email,
    "Verify Your Email",
    `<p>Your verification code is <b>${OTP}</b>. It expires in 10 minutes.</p>`
  );
const updateOtp = await UnverifiedUser.updateOne({ email }, { $set: {OTP, otpExpiry: Date.now() + 10 * 60 * 1000 } });
  if(updateOtp.modifiedCount === 0){
    throw new ApiError(401,{},"Failed to Resend OTP!")
  }
  res.status(200).json(new ApiResponse(200,{},`OTP sent to your ${email}`))
} catch (error) {
  res.status(500).json(new ApiError(error.statusCode,error.error,error.message))
}
} 
