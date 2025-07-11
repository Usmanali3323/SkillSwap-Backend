import { Router } from "express";

import { verifyUser } from "../Middleware/auth.middleware.js";
import { upload } from "../Middleware/multer.middleware.js";
import { forgotPasswordController, resetPasswordController } from "../Controllers/user/auth/forgetPasswordController.js";
import { logOutUserController } from "../Controllers/user/auth/logOutController.js";
import { getUserController } from "../Controllers/user/auth/getUserController.js";
import { updateUserProfileController } from "../Controllers/user/auth/updateUserProfileController.js";
import { checkAuthController } from "../Controllers/user/auth/checkAuthController.js";
import { registerUserController } from "../Controllers/user/auth/registerController.js";
import { verifiedAccountController } from "../Controllers/user/auth/emailVerifyController.js";
import { loginUserController } from "../Controllers/user/auth/loginController.js";
import { resendOtpController } from "../Controllers/user/auth/otpResendController.js";



const router = Router();
router.route("/register").post(registerUserController);
router.route('/verify').post(verifiedAccountController)
router.route('/login').post(loginUserController)
router.route('/logout').post(verifyUser,logOutUserController)
router.route('/resend-otp').post(resendOtpController)
router.route('/forget-password').post(forgotPasswordController)
router.route('/reset-password').post(resetPasswordController)
router.route('/check-auth').get(verifyUser,checkAuthController)
router.route('/update-profile').patch(verifyUser,  upload.fields([
    {
      name: "profileImage",
      maxCount: 1
    }
  ]), updateUserProfileController)
router.route('/get-user').get(verifyUser, getUserController)
// router.route('/add-skill').post(
//   verifyUser,
//   upload.fields([
//     {
//       name: "coverImage",
//       maxCount: 1
//     }
//   ]),
//   addSkillController
// );



export default router;
