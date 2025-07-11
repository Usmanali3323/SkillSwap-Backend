import mongoose from "mongoose";

const RoomSchema = mongoose.Schema({
    skillId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Skill",
        required:true,
        unique:true
    },
    members:[
        {
          user:  {
             type : mongoose.Schema.Types.ObjectId,
             ref:"User"
          },
          role:{
            type : String,
            default:'user'
          }
        }
    ],
    permission:{
      type:String,
      default:'public'
    }
}) 

export const Room = mongoose.model("Room", RoomSchema);