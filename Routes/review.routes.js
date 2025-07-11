import {Router} from "express"
import { verifyUser } from "../Middleware/auth.middleware.js";
import {getApplicationAllReviewController, getSkillAllReviewController, saveApplicationReviewController, saveReviewController} from "../Controllers/user/reviewController.js";

const router = Router();

router.route('/send-review').post(verifyUser,saveReviewController);
router.route('/get-review/:skillId').get(getSkillAllReviewController);

router.route('/send-review/application').post(verifyUser,saveApplicationReviewController);
router.route('/all-review/application').get(getApplicationAllReviewController);
export default router 