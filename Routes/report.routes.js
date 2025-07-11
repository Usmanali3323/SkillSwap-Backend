import { Router } from "express";
import { getAllReportsController, readReportByAdminController, sendReportController } from "../Controllers/report/reportController.js";
import { isAdmin, verifyUser } from "../Middleware/auth.middleware.js";

const router = Router()

router.route('/:skillId').post(verifyUser, sendReportController)
router.route('/get-all').get(verifyUser,isAdmin,getAllReportsController);
router.route('/read-report').post(readReportByAdminController);


export default router