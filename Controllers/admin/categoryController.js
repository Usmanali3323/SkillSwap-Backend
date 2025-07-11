import { Category } from "../../Models/category.model.js";
import { ApiError } from "../../utils/ApiError.js";



export const addCategoryController = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      throw new ApiError(400, "Category name is required");
    }

    const newCategory = await Category.create({ name });

    return res.status(201).json({
      success: true,
      message: "Category added successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error in addCategoryController:", error);
    res.json(new ApiError(error.statusCode,error.error,error.message));
  }
};


export const updateCategoryController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      throw new ApiError(400, {},"New category name is required");
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!updatedCategory) {
      throw new ApiError(404,{}, "Category not found");
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error in updateCategoryController:", error);
    res.json(new ApiError(error.statusCode,error.error,error.message));
  }
};

