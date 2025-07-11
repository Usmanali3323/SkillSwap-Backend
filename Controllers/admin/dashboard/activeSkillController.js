import { Skill } from "../../../Models/Skill.model.js"
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

const activeSkillConntroller = async(req,res)=>{
try {
    const activeSkill = await Skill.find({isVerify:true}).populate("review");
    if(!activeSkill){
             return res.status(200).json(
                new ApiResponse(200,activeSkill,"No Skill found")
            )
    }
    return res.status(200)
              .json(
                new ApiResponse(200,activeSkill,"No Skill found")
               )
} catch (error) {
     res.status(error.statusCode)
        .json(
            new ApiError(error.statusCode,error.error,error.message)
     )
}
}

export {activeSkillConntroller}