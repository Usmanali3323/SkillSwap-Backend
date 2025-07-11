import { Category } from "../../Models/category.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const getAllCategoriesController = async (req, res, next) => {
  try {
    const categories = await Category.find();

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    console.error("Error in getAllCategoriesController:", error);
    res.json(new ApiError(error.statusCode,error.error,error.message));
  }
};

