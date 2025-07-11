import {Router} from 'express'
import { verifyUser } from '../Middleware/auth.middleware.js';
import { changeRoomPermissionController, changeUserRoleController, getAllMemberOfRoomcontroller, getChatController, getRoomcontroller, leftCommunityByUserController, removeRoomMemberController } from '../Controllers/user/chatController.js';

const router = Router();

router.route('/get-room/:userId').get(verifyUser,getRoomcontroller);
router.route('/reterive-chats').post(verifyUser,getChatController);
router.route('/upload/:roomId').post(verifyUser,getChatController);
router.route('/remove-member').post(verifyUser,removeRoomMemberController);
router.route('/all-members/:roomId').get(verifyUser,getAllMemberOfRoomcontroller);
router.route('/change-permission').post(verifyUser,changeRoomPermissionController);
router.route('/change-role').post(verifyUser,changeUserRoleController);
router.route('/left-community').post(verifyUser,leftCommunityByUserController);

export default router