import {Router} from "express"
import { isAdmin, verifyUser } from "../Middleware/auth.middleware.js";
import { deleteSkillController, getAllSkillRequestsController, userSkillController, verifySkillController } from "../Controllers/admin/userSkillController.js";
import { viewAllUserController } from "../Controllers/admin/dashboard/viewAllUserController.js";
import { deleteUserController } from "../Controllers/admin/dashboard/deleteUserController.js";

import { activeSkillConntroller } from "../Controllers/admin/dashboard/activeSkillController.js";
import { activeUserController, allRegisterUserController } from "../Controllers/admin/dashboard/UserController.js";
import { deleteReviewController } from "../Controllers/admin/reviewController.js";
import { getMessagesBySkillId } from "../Controllers/admin/chatController.js";
import { readReportByAdminController } from "../Controllers/report/reportController.js";

const router =Router();

router.route('/all-user').get(verifyUser, isAdmin,viewAllUserController)
router.route('/delete-user/:userId').delete(verifyUser, isAdmin,deleteUserController)
router.route('/user-skill/:userId').get(verifyUser,isAdmin,userSkillController)
router.route('/active-users').get(verifyUser,isAdmin,activeUserController)
router.route('/register-users').get(verifyUser,isAdmin,allRegisterUserController)
router.route('/active-skill').get(verifyUser,isAdmin,activeSkillConntroller)
router.route('/delete-review/:reviewId').delete(verifyUser,isAdmin,deleteReviewController)
router.route('/delete-skill/:skillId').delete(verifyUser,isAdmin,deleteSkillController)
router.route('/chat/:skillId').get(verifyUser,isAdmin,getMessagesBySkillId)
router.route('/read-report').post(verifyUser,isAdmin, readReportByAdminController);
router.route('/verify-skill/:skillId').patch(verifyUser,isAdmin, verifySkillController);

router.route('/skill-requests').get(verifyUser,isAdmin, getAllSkillRequestsController);

export default router;