import { Router } from "express";
import { verifyUser } from "../Middleware/auth.middleware.js";
import { getNotificationsController, createNotificationcontroller } from "../Controllers/report/notificationController.js";

const router  = Router();

router.route('/:userId').get(verifyUser,getNotificationsController);
router.route('/create').post(verifyUser,createNotificationcontroller);



export default router;