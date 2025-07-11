import { ApiResponse } from "../../../utils/ApiResponse.js"

export const checkAuthController = (req,res)=>{
    res.status(200).json(new ApiResponse(200,{},"Authorized User "))
}