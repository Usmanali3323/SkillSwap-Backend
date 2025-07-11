import { Router } from "express";
import { handleConnectionRequescontroller, listConnectionRequestsToProviderController, myRequestConnectionController, updateConnectionController } from "../Controllers/user/connectionController.js";
import { verifyUser } from "../Middleware/auth.middleware.js";

const router = Router();

router.route('/request/:requesterId').post( handleConnectionRequescontroller);
router.route('/all-request').get(verifyUser ,listConnectionRequestsToProviderController);
router.route('/update-status/:connectionId').patch(verifyUser ,updateConnectionController);
router.route('/my-requests').get(verifyUser ,myRequestConnectionController);

export default router
