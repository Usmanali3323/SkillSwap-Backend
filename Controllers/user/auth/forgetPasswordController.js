import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../../../Models/user.model.js';
import sendEmail from '../../../utils/sendEmail.js';
import { ApiError } from '../../../utils/ApiError.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';


export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError(400, {}, "Email is required");

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: "email doesn't exists" });
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashed = await bcrypt.hash(resetToken, 10);

    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${user._id}`;

    await sendEmail(
      user.email,
      "Password Reset Request",
      `<p>Click the link to reset your password (valid for 1 hour): <a href="${resetURL}">${resetURL}</a></p>`
    );

    res.json({ success: true, message: "If that email exists, a reset link was sent." });
  } catch (error) {
    res.json(new ApiError(error.statusCode,error.error,error.message))
  }
};

export const resetPasswordController = async (req,res)=>{
try {
    const {token , id, newPassword} = req.body;
    if(!token || !id || !newPassword){
      throw new ApiError(404,{},"newPassword is required")
    }
    if(newPassword.length < 6){   
        throw new ApiError(401,{},"Password must be contain atleast 6 character")
    }
    const user = await User.findById(id);
    if(!user || !user.resetPasswordExpires || !user.resetPasswordToken){
        throw new ApiError(401,{},"user is not found")
    }
    const match = bcrypt.compare(token,user.resetPasswordToken);
    if(!match){
      throw new ApiError(401,{},"invalid Token")
    }
    user.password=newPassword;
    user.resetPasswordToken=undefined
    user.resetPasswordExpires=undefined
    user.save();
    res.json(new ApiResponse(200,{},"Password Reset successfully"))
} catch (error) {
    res.json(new ApiError(error.statusCode,error.error,error.message))
}
}