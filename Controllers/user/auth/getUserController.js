import User from "../../../Models/user.model.js";
import { ApiError } from "../../../utils/ApiError.js"
import { ApiResponse } from "../../../utils/ApiResponse.js";

export const getUserController = async(req,res)=>{
    try {
      const userId = req.user._id;
      const user = await User.findById(userId).select("fullName bio profileImage designation");
      if(!user){
        throw new ApiError(404,{},"user not found")
      } 
      res.json(new ApiResponse(200,user,"Fetch User Record successfully"))
    } catch (error) {
     res.json(new ApiError(error.statusCode,error.error,error.message))   
    }
}