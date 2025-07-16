import UnverifiedUser from "../../../Models/unverifiedUser.model.js";
import User from "../../../Models/user.model.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import Jwt from 'jsonwebtoken'
import { generateAccessTokenAndRefereshToken } from "../../../utils/generateToken.js";

export const refreshAccessToken = async(req,res)=>{
   const incomingRefreshToken = req?.cookie?.refreshToken || req.body.refreshToken;
   if(!incomingRefreshToken){
      throw new ApiError(401,"invalid access token");
   }
   const decodeToken = await Jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN);
   if(!decodeToken){
    throw new ApiError(401,"invalid token");
   }
   const user =await User.findById(decodeToken?._id);
   if(!user){
    throw new ApiError(401,"Invalid Token");
   }
   console.log(decodeToken);
   if(user?.refreshToken!=incomingRefreshToken){
    throw new ApiError(401,"Invalid Token");
   }
  const {accessToken,refreshToken}=await generateAccessTokenAndRefereshToken(user?._id);
  await User.updateOne(
  { _id: user._id },
  { $set: { refreshToken } }
  );

  const options = {
    httpOnly:true,
    secure:true,
     sameSite:"None"
  }
  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(new ApiResponse(200,{accessToken,refreshToken},"successfully login"))
}
