import User from "../../../Models/user.model.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";


export const logOutUserController = async(req,res)=>{
    
   const user = await User.findByIdAndUpdate(req.user._id,{$set : {refreshToken: ""}},{new:true});
   user.isActive = false;
   user.lastActiveAt = null;
   const logOutUser = await user.save();

   const options = {
    httpOnly:true,
    secure:true,
    sameSite:"Strict"
   }
    res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,logOutUser,"successfully logout"))
}