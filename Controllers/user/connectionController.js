import { Connection } from "../../Models/connection.model.js";
import { Room } from "../../Models/room.js";
import { Skill } from "../../Models/Skill.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const handleConnectionRequescontroller = async(req,res)=>{
  try {
   const {skillId,message,providerId}= req.body;
   const {requesterId} = req.params
   
   if(!skillId || !providerId || !requesterId){
    throw new ApiError(404,{},"All fields are required")
   }
   if(providerId==requesterId){
    throw new ApiError(400,{},"your Provider")
   }
   const checkJoined = await Room.findOne({
  skillId,
  'members.user': requesterId
});
if(checkJoined){
  throw new ApiError(409,{},"You Already have joined")
}
   const checkConnection = await Connection.find({skillId , requesterId});
   if(checkConnection.length>0){ 
   throw new ApiError(409,{},"Already sent request")
   }
   const createConnectionRequest = await Connection.create({
    requesterId,
    providerId,
    requestMessage:message,
    skillId
   })
res.json(new ApiResponse(200,createConnectionRequest,"Request send successfully"))
  } catch (error) {
    res.json(new ApiError(error.statusCode,error.error,error.message
    ))
  }
}

export const listConnectionRequestsToProviderController = async (req,res)=>{
  try {
  const connectionList = await Connection.find({
  providerId: req.user._id,
  status: 'pending', // Only show new requests as notifications
})
  .sort({ createdAt: -1 }) // Newest first
  .populate('requesterId', 'fullName email profileImage')
  .populate('skillId', 'title description imagesUrl')
  .lean(); // Lean makes result plain JS objects (good for frontend)

   if(!connectionList){
    throw new ApiError(404,{},"No Request Found");
   }
   res.json(new ApiResponse(200,connectionList,"All Request fetched"))
  } catch (error) {
      res.json(new ApiError(error.statusCode,error.error,error.message
    ))
  }
}


export const updateConnectionController = async (req, res) => {
  try {
    const { connectionId } = req.params;
    let { status,role} = req.body;
    let userRole;
    if(!role){
    var userrRole="user"
   }else{
    userRole=role;
   }
    if (!status || !connectionId) {
      throw new ApiError(400, {}, "All fields are required");
    }

    status = status.toLowerCase();

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      throw new ApiError(404, {}, "Connection not found");
    }

    if (status === "accepted") {
   const alreadyAccepted = await Room.findOne({
  skillId: connection.skillId,
  'members.user': connection.requesterId
  });

      if (alreadyAccepted) {
        throw new ApiError(409, {}, "User already joined this skill");
      }

  const updatedRoom = await Room.findOneAndUpdate(
    { skillId: connection.skillId },
    { $push: { members: { user: connection.requesterId, role: "user" } } },
    { new: true } // important: return the updated document
   ).populate("skillId");

console.log(updatedRoom,"updated room");

      
    if(!updatedRoom){
      throw new ApiError(401,{},"user didn't added in community")
    }
    res.json(new ApiResponse(200, updatedRoom, `${status} successfully`));
    }

    await Connection.deleteOne({ _id: connectionId });

    res.json(new ApiResponse(200, {}, `${status} successfully`));
  } catch (error) {
    res.json(
      new ApiError(error.statusCode , error.error, error.message )
    );
  }
};


export const  myRequestConnectionController = async(req,res)=>{
  try {
    const myRequests = await Connection.find({requesterId:req?.user?._id}).populate('requesterId skillId').populate("providerId",'fullName');
    if(myRequests.length==0){
      return res.status(200).json(new ApiResponse(200,myRequests,"No Reqest Found"))
    }
    return res.status(200).json(new ApiResponse(200,myRequests,"Requests Fetch Successfully"))
  } catch (error) {
    res.status(500)
    .json(new ApiError(error.statusCode,error,error.message))
  }
}

