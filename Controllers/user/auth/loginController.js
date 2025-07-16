import User from "../../../Models/user.model.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { generateAccessTokenAndRefereshToken } from "../../../utils/generateToken.js";

export const loginUserController = async(req,res)=>{
  try{
const {email,password}=req.body;
if(!email && !password){
    throw new ApiError(401,{},"username or password required");
}
const user = await User.findOne({email});
if(!user){
    throw new ApiError(404,{},"username is incorrect");
}
const isPasswordValid= await user.isPasswordCorrect(password);
if(!isPasswordValid){
throw new ApiError(404,{},"Password is incorrect");
}

user.isActive = true;
user.lastActiveAt = new Date(); // Set current time
await user.save();
const logginUser = await User.findById(user._id)
.select("-password -refreshToken");


const options = {
    httpOnly:true,
    secure : true,
    sameSite:"None"
}

const {accessToken,refreshToken} = await generateAccessTokenAndRefereshToken(user._id);
res.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
res.json(new ApiResponse(200,{
     user:logginUser,
     accessToken
},
"Login Successfully"
));
  }catch(error){
    res.json(new ApiError(error.statusCode,error.error,error.message))
  }
}
