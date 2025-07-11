import mongoose from "mongoose";

const CategorySchema = mongoose.Schema({
 name: {
      type: String,
      required: [true, "Category is required"],
    },
})

export const Category = mongoose.model("Category", CategorySchema);