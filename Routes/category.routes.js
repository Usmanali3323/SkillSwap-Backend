import { Router } from "express";
import { addSkillController, getUserSkillsController  } from "../Controllers/user/skillController.js";
import { verifyUser } from "../Middleware/auth.middleware.js";
import { addCategoryController, updateCategoryController } from "../Controllers/admin/categoryController.js";
import { getAllCategoriesController } from "../Controllers/user/categoryController.js";

const router = Router();

router.route('').get(getAllCategoriesController);
router.route('/add-category').post(addCategoryController);
router.route("/update-category/:id").patch(updateCategoryController);

export default router;