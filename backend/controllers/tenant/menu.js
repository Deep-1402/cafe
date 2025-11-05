import { getTenantConnection } from "./tenant.js";

const createDish = async (req, res) => {
  try {
    const data = req.body;

    // Validation
    if (!data.category_id || !data.name || !data.price) {
      return res.status(400).json({
        message: "Category, name, and price are required",
      });
    }

    // Get tenant connection
    const { models } = await getTenantConnection(req.jwtData.email);
    const { Dishes, Category } = models;

    // Check if category exists
    const category = await Category.findByPk(data.category_id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Validate price
    if (parseFloat(data.price) < 0) {
      return res.status(500).json({
        message: "Price cannot be negative",
      });
    }
    console.log(data);
    // Create dish
    const dish = await Dishes.create(data);

    // Get dish with category
    const dishWithCategory = await Dishes.findByPk(dish.menu_id, {
      // include: [
      //   {
      //     model: Category,
      //     as: "category",
      //     attributes: ["category_id", "name"],
      //   },
      // ],
    });

    res.status(200).json({
      success: true,
      message: "Dish created successfully",
      data: dishWithCategory,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
      message: error.message,
    });
  }
};

const updateDish = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get tenant connection
    const { models } = await getTenantConnection(req.jwtData.email);
    const { Dishes, Category } = models;

    // Check if dish exists
    const dish = await Dishes.findByPk(id);
    if (!dish) {
      return res.status(404).json({
        error : error,
        message: "Dish not found",
      });
    }

    // Validate category if being updated
    if (updateData.category_id) {
      const category = await Category.findByPk(updateData.category_id);
      if (!category) {
        return res.status(404).json({
          error : error,
          message: "Category not found",
        });
      }
    }

    // Validate price if being updated
    if (updateData.price !== undefined && parseFloat(updateData.price) < 0) {
      return res.status(400).json({
        error : error,
        message: "Price cannot be negative",
      });
    }

    // Update dish
    await Dishes.update(updateData, { where: { menu_id: id } });

    // Get updated dish
    const updatedDish = await Dishes.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "name"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Dish updated successfully",
      data: updatedDish,
    });
  } catch (error) {
    res.status(500).json({
      error : error,
      message: error.message,
    });
  }
};

const deleteDish = async (req, res) => {
  try {
    const { id } = req.params;

    // Get tenant connection
    const { models } = await getTenantConnection(req.jwtData.email);
    const { Dishes } = models;

    // Check if dish exists
    const dish = await Dishes.findByPk(id);
    if (!dish) {
      return res.status(404).json({
        error : error,
        message: "Dish not found",
      });
    }

    // Soft delete
    await Dishes.destroy({ where: { menu_id: id } });

    res.status(200).json({
      success: true,
      message: "Dish deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error : error,
      message: error.message,
    });
  }
};

const getAllAvailableDishes = async (req, res) => {
  try {
    // Get tenant connection
    const { models } = await getTenantConnection(req.jwtData.email);
    const { Dishes, Category } = models;

    // Get All dish
    const allDishes = await Dishes.findAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "name"],
        },
      ],
      where: { is_available: true },
    });

    res.status(200).json({
      message: `All Dishes Availble"
      }`,
      data: allDishes,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
      message: error.message,
    });
  }
};
const exportedModules = {
  createDish,
  updateDish,
  deleteDish,
  getAllAvailableDishes,
};
export default exportedModules;
