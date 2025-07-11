import { Router } from "express";

import { addSkillController, getAllSkillController, getSkillByIdController, getSkillsByUserController, getUsersEnrolledInSkillController, getUserSkillsController, JoinSkillController, SkillApprovalRequestByUserController  } from "../Controllers/user/skillController.js";
import { verifyUser } from "../Middleware/auth.middleware.js";
import { upload } from "../Middleware/multer.middleware.js";


const router = Router();

router.route('/add-skill').post(
  verifyUser,
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1
    }
  ]),
  addSkillController
);

router.route('/get-skill').get(verifyUser, getUserSkillsController);
router.route('/all-skill').get(getAllSkillController);
router.route('/all-skill/:userId').get(getAllSkillController);
router.route('/get-skill/:providerId').get(getSkillsByUserController)
router.route('/get-enroll-Skill/:userId').get(getUsersEnrolledInSkillController)
router.route('/join-skill/:userId').get(JoinSkillController)
router.route('/single-skill/:skillId').get(getSkillByIdController)
router.route('/skill-request/:userId').get(verifyUser, SkillApprovalRequestByUserController)

export default router;