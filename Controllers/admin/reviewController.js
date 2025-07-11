import Review from "../../Models/review.model.js";
import { Skill } from "../../Models/Skill.model.js";


export const deleteReviewController = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const skillId = review.skillId;

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    // Remove review reference from the skill
    await Skill.findByIdAndUpdate(skillId, {
      $pull: { review: reviewId }
    });

    return res.status(200).json({
      success: true,
      message: 'Review deleted and removed from skill',
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting review',
    });
  }
};
