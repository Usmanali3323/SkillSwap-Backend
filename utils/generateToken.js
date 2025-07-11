import User from "../Models/user.model.js";

export const generateAccessTokenAndRefereshToken = async(userId)=>{
const user = await User.findById(userId);
const accessToken = user.generateAccessToken("5h");
const refreshToken = user.generateRefreshToken("12h");
user.refreshToken=refreshToken;
user.save({validateBeforeSave:false});
return {refreshToken,accessToken}
}
