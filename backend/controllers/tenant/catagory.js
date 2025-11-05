import { Op } from "sequelize";
import { getTenantConnection } from "./tenant.js";

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { models } = await getTenantConnection(req.jwtData.email);
    const { Category } = models;

    // Check if category with same name exists
    const existingCategory = await Category.findOne({
      where: { name },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    // Create category
    const category = await Category.create({
      name,
      description,
    });

    res.status(200).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    // Get tenant connection
    const { models } = await getTenantConnection(req.jwtData.email);

    const { Category, Dishes } = models;

    // Get categories with pagination
    const categories = await Category.findAll({
      include: [
        {
          model: Dishes,
          as: "menus",
          attributes: ["menu_id", "name", "price", "is_available"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
      message: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get tenant connection
    const { models } = await getTenantConnection(req.jwtData.email);
    const { Category, Dishes } = models;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Dishes,
          as: "menus",
          // attributes: [
          //   "menu_id",
          //   "name",
          //   "description",
          //   "price",
          //   "discount_price",
          //   "image_url",
          //   "is_available",
          //   "is_vegetarian",
          //   "is_spicy",
          // ],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Get tenant connection
    const { models } = await getTenantConnection(req.jwtData.email);
    const { Category } = models;

    // Check if category exists
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if new name conflicts with existing category
    const existingCategory = await Category.findOne({
      where: {
        name: data.name,
        category_id: { [Op.ne]: id },
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const updatedCategory = await Category.update(data, {
      where: { category_id: id },
    });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Get tenant connection
    const { models } = await getTenantConnection(req.jwtData.email);
    const { Category, Dishes } = models;

    // Check if category exists
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category has dishes
    const dishCount = await Dishes.count({
      where: { category_id: id },
    });

    if (dishCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${dishCount} dish(es). Please reassign or delete them first.`,
      });
    }

    // Soft delete
    await Category.destroy({ where: { category_id: id } });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const exportedModules = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
export default exportedModules;
