import User from "../../../Models/user.model.js"
import { ApiError } from "../../../utils/ApiError.js"
import { ApiResponse } from "../../../utils/ApiResponse.js";


const activeUserController = async(req,res)=>{
    try {
        const activeUser = await User.find({isActive:true,role:"user"});
        if(!activeUser){
           return res.status(200).json(
                new ApiResponse(200,activeUser,"No user found")
            )
        }
        res.status(200).json(
           new ApiResponse(200,activeUser,"Active User Fetch Successfully")
        )
    } catch (error) {
        res.status(500)
        .json(
            new ApiError(error.statusCode,error.error,error.message)
        )
    }
}

const allRegisterUserController = async(req,res)=>{
    try {
        const registerUser  = await User.find({role:"user"});
        if(!registerUser){
        return res.status(200).json(
                new ApiResponse(200,registerUser,"No user found")
            )
        }
         return  res.status(200).json(
                new ApiResponse(200,registerUser,"register users fetch sucessfully")
            )
    } catch (error) {
                res.status(error.statusCode)
        .json(
            new ApiError(error.statusCode,error.error,error.message)
        )
    }
}


export {activeUserController, allRegisterUserController}