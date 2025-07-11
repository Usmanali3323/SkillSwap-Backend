
import Review from '../../Models/review.model.js';
import { Skill } from '../../Models/Skill.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';


export const saveReviewController = async (req, res) => {
  try {
    const { comment, rating, skillId } = req.body;
    const senderId = req?.user?._id;

    if (!comment || !rating || !skillId) {
      throw new ApiError(400, "All fields are required");
    }

    const skill = await Skill.findById(skillId).select("providerId");
    if (!skill) {
      return res.status(404).json(new ApiError(404, {}, "Skill not found"));
    }

    if (skill.providerId.toString() === senderId.toString()) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "You can't review your own skill"));
    }

    const existingReview = await Review.findOne({ skillId, senderId });

    let review;

    if (!existingReview) {
      // Create new review
      review = await Review.create({
        senderId,
        comment,
        rating,
        skillId,
      });

      // Push review ID to Skill
      await Skill.findByIdAndUpdate(
        skillId,
        { $push: { review: review._id } },
        { new: true }
      );

      return res
        .status(201)
        .json(new ApiResponse(201, review, "Review submitted successfully"));
    } else {
      // Update existing review
      review = await Review.findOneAndUpdate(
        { skillId, senderId },
        { comment, rating },
        { new: true }
      );

      return res
        .status(200)
        .json(new ApiResponse(200, review, "Review updated successfully"));
    }
  } catch (error) {
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error, error.message));
  }
};



export const getSkillAllReviewController = async (req, res) => {
  try {
    const skillId = req.params.skillId;

    if (!skillId) {
      throw new ApiError(400, {}, "SkillId is required");
    }

    const review = await Review.find({ skillId }).populate("senderId", "fullName profileImage");

    if (!review || review.length === 0) {
      return res.status(200).json(new ApiResponse(200, [], "No reviews found for this skill"));
    }

    return res.status(200).json(new ApiResponse(200, review, "Reviews fetched successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode , error, error.message ));
  }
};

export const saveApplicationReviewController = async(req,res)=>{
  try {
    const {userId,comment,rating}=req.body;
    if(!userId || !comment ||!rating){
      throw new ApiError(404,{},"all field are required");
    }
    if(userId==req.user._id){
const systemFeedback = await Review.findOne({
  senderId: userId,
  skillId: { $exists: false }
});
if(systemFeedback){
  const updateFeedback = await Review.findByIdAndUpdate(systemFeedback,{comment,rating},{new:true})
 return res.status(200).json(new ApiResponse(200,updateFeedback,"Thanks for your Feedback"))
}
      const createFeedback = await Review.create({
        senderId: userId,
        comment,
        rating
      })
      res.status(200).json(new ApiResponse(200,createFeedback,"Thanks for your Feedback"))
    }
  } catch (error) {
    res.status(error.statusCode||500).json(new ApiError(error.statusCode,error.error,error.message))
  }
}

export const getApplicationAllReviewController = async(req,res)=>{
  try {
    const getAllFeedback = await Review.find({skillId:{$exists : false}}).populate('senderId')
    if(getAllFeedback.length==0){
          res.status(200).json(new ApiResponse(200,getAllFeedback,"No feedback found"))
    }
    res.status(200).json(new ApiResponse(200,getAllFeedback,"All feedback fetch successfully"))
  } catch (error) {
        res.status(error.statusCode||500).json(new ApiError(error.statusCode,error.error,error.message))
  }
}