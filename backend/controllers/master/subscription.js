import Subscription from "../../models/master/subscription.js";
import Tenants from "../../models/master/tenants.js"
const createSubscription = async (req, res) => {
  try {
    const data = req.body;

    // Check if plan with same name already exists
    const existingPlan = await Subscription.findOne({
      where: { name: data.name },
    });

    if (existingPlan) {
      return res.status(500).json({
        success: false,
        message: `A subscription plan with name '${data.name}' already exists`,
      });
    }

    // Validate price
    if (parseFloat(data.price) < 0) {
      return res.status(500).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    // Validate max_users
    if (parseInt(data.max_users) < 1) {
      return res.status(500).json({
        success: false,
        message: "Max users must be at least 1",
      });
    }

    // Create subscription
    const subscription = await Subscription.create(data);

    res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
      message: error.message,
    });
  }
};

const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Check if subscription exists
    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    // Validate price
    if (data.price !== undefined && parseFloat(data.price) < 0) {
      return res.status(500).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    // Validate max_users
    if (data.max_users !== undefined && parseInt(data.max_users) < 1) {
      return res.status(500).json({
        success: false,
        message: "Max users must be at least 1",
      });
    }

    await Subscription.update(data, { where: { id } });

    // Get updated subscription
    const updatedSubscription = await Subscription.findByPk(id);

    res.status(200).json({
      success: true,
      message: "Subscription plan updated successfully",
      data: updatedSubscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subscription exists
    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    // Check if any tenants are using this plan
    const tenantCount = await Tenants.count({
      where: { plan_id: id },
    });

    if (tenantCount > 0) {
      return res.status(500).json({
        success: false,
        message: `Cannot delete this plan. ${tenantCount} tenant(s) are currently subscribed to it. Please migrate them to another plan first.`,
      });
    }

    // Delete subscription
    await Subscription.destroy({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Subscription plan deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByPk(id, {
      include: [
        {
          model: Tenants,
          attributes: [
            "tenant_id",
            "restaurant_name",
            "subdomain",
            "email",
            "is_active",
            "end_date",
            "createdAt",
          ],
        },
      ],
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      error,
      message: error.message,
    });
  }
};

const getAllSubscription= async (req, res) => {
  try {

    const subscription = await Subscription.findAll( {
      include: [
        {
          model: Tenants,
          attributes: [
            "tenant_id",
            "restaurant_name",
            "subdomain",
            "email",
            "is_active",
            "end_date",
            "createdAt",
          ],
        },
      ],
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    let info = { id : subscription.id , name : subscription.name}

    res.status(200).json({
      success: true,
      data: subscription,
      info
    });
  } catch (error) {
    res.status(500).json({
      error,
      message: error.message,
    });
  }
};

const exportedModules = {
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionById,
  getAllSubscription
};
export default exportedModules;

/*
import Subscription from "../models/master/subscription.js";
import Tenants from "../models/master/tenants.js";
import { Op } from "sequelize";

/**
 * @desc    Get All Subscription Plans
 * @route   GET /api/master/subscriptions
 * @access  Private (Master Admin) or Public (for registration)
 
const getAllSubscriptions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      is_active = "",
      sort_by = "id",
      sort_order = "ASC",
      include_inactive = "false",
    } = req.query;

    // Build where clause
    const whereClause = {};

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Active status filter
    if (is_active !== "") {
      whereClause.is_active = is_active === "true";
    } else if (include_inactive === "false") {
      // By default, only show active plans for public
      whereClause.is_active = true;
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get subscriptions with pagination
    const { count, rows: subscriptions } = await Subscription.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [[sort_by, sort_order.toUpperCase()]],
      include: [
        {
          model: Tenants,
          attributes: ["tenant_id", "restaurant_name", "subdomain"],
          required: false,
        },
      ],
    });

    // Add tenant count to each subscription
    const subscriptionsWithCount = await Promise.all(
      subscriptions.map(async (sub) => {
        const tenantCount = await Tenants.count({
          where: { plan_id: sub.id },
        });

        const activeTenantCount = await Tenants.count({
          where: { plan_id: sub.id, is_active: true },
        });

        return {
          ...sub.toJSON(),
          tenant_count: tenantCount,
          active_tenant_count: activeTenantCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        subscriptions: subscriptionsWithCount,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get Single Subscription Plan
 * @route   GET /api/master/subscriptions/:id
 * @access  Private (Master Admin) or Public
 req.jwtData.email
const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByPk(id, {
      include: [
        {
          model: Tenants,
          attributes: [
            "tenant_id",
            "restaurant_name",
            "subdomain",
            "email",
            "is_active",
            "end_date",
            "createdAt",
          ],
        },
      ],
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    // Get tenant statistics
    const totalTenants = await Tenants.count({
      where: { plan_id: id },
    });

    const activeTenants = await Tenants.count({
      where: { plan_id: id, is_active: true },
    });

    const monthlyRevenue = parseFloat(subscription.price) * activeTenants;

    res.status(200).json({
      success: true,
      data: {
        ...subscription.toJSON(),
        statistics: {
          total_tenants: totalTenants,
          active_tenants: activeTenants,
          inactive_tenants: totalTenants - activeTenants,
          monthly_revenue: monthlyRevenue.toFixed(2),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Create New Subscription Plan
 * @route   POST /api/master/subscriptions
 * @access  Private (Master Admin)
 req.jwtData.email
const createSubscription = async (req, res) => {
  try {
    const { name, price, description, max_users, is_active = true } = req.body;

    // Validation
    if (!name || !price || !max_users) {
      return res.status(500).json({
        success: false,
        message: "Please provide name, price, and max_users",
      });
    }

    // Validate name enum
    const validNames = ["Basic", "Standard", "Premium"];
    if (!validNames.includes(name)) {
      return res.status(500).json({
        success: false,
        message: `Name must be one of: ${validNames.join(", ")}`,
      });
    }

    // Check if plan with same name already exists
    const existingPlan = await Subscription.findOne({
      where: { name },
    });

    if (existingPlan) {
      return res.status(500).json({
        success: false,
        message: `A subscription plan with name '${name}' already exists`,
      });
    }

    // Validate price
    if (parseFloat(price) < 0) {
      return res.status(500).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    // Validate max_users
    if (parseInt(max_users) < 1) {
      return res.status(500).json({
        success: false,
        message: "Max users must be at least 1",
      });
    }

    // Create subscription
    const subscription = await Subscription.create({
      name,
      price,
      description,
      max_users,
      is_active,
    });

    res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update Subscription Plan
 * @route   PUT /api/master/subscriptions/:id
 * @access  Private (Master Admin)
 req.jwtData.email
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, max_users, is_active } = req.body;

    // Check if subscription exists
    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    // Validate name if being updated
    if (name && name !== subscription.name) {
      const validNames = ["Basic", "Standard", "Premium"];
      if (!validNames.includes(name)) {
        return res.status(500).json({
          success: false,
          message: `Name must be one of: ${validNames.join(", ")}`,
        });
      }

      // Check if new name already exists
      const existingPlan = await Subscription.findOne({
        where: { name, id: { [Op.ne]: id } },
      });

      if (existingPlan) {
        return res.status(500).json({
          success: false,
          message: `A subscription plan with name '${name}' already exists`,
        });
      }
    }

    // Validate price
    if (price !== undefined && parseFloat(price) < 0) {
      return res.status(500).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    // Validate max_users
    if (max_users !== undefined && parseInt(max_users) < 1) {
      return res.status(500).json({
        success: false,
        message: "Max users must be at least 1",
      });
    }

    // Update subscription
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (max_users !== undefined) updateData.max_users = max_users;
    if (is_active !== undefined) updateData.is_active = is_active;

    await Subscription.update(updateData, { where: { id } });

    // Get updated subscription
    const updatedSubscription = await Subscription.findByPk(id);

    res.status(200).json({
      success: true,
      message: "Subscription plan updated successfully",
      data: updatedSubscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete Subscription Plan
 * @route   DELETE /api/master/subscriptions/:id
 * @access  Private (Master Admin)
 req.jwtData.email
const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subscription exists
    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    // Check if any tenants are using this plan
    const tenantCount = await Tenants.count({
      where: { plan_id: id },
    });

    if (tenantCount > 0) {
      return res.status(500).json({
        success: false,
        message: `Cannot delete this plan. ${tenantCount} tenant(s) are currently subscribed to it. Please migrate them to another plan first.`,
      });
    }

    // Delete subscription
    await Subscription.destroy({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Subscription plan deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Toggle Subscription Active Status
 * @route   PATCH /api/master/subscriptions/:id/toggle-status
 * @access  Private (Master Admin)
 req.jwtData.email
const toggleSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subscription exists
    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    // Check if deactivating
    if (subscription.is_active) {
      // Count active tenants using this plan
      const activeTenantCount = await Tenants.count({
        where: { plan_id: id, is_active: true },
      });

      if (activeTenantCount > 0) {
        return res.status(500).json({
          success: false,
          message: `Cannot deactivate this plan. ${activeTenantCount} active tenant(s) are currently subscribed to it.`,
        });
      }
    }

    // Toggle status
    const newStatus = !subscription.is_active;
    await Subscription.update({ is_active: newStatus }, { where: { id } });

    // Get updated subscription
    const updatedSubscription = await Subscription.findByPk(id);

    res.status(200).json({
      success: true,
      message: `Subscription plan ${newStatus ? "activated" : "deactivated"} successfully`,
      data: updatedSubscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get Subscription Statistics
 * @route   GET /api/master/subscriptions/stats
 * @access  Private (Master Admin)
 req.jwtData.email
const getSubscriptionStats = async (req, res) => {
  try {
    // Total plans
    const totalPlans = await Subscription.count();

    // Active plans
    const activePlans = await Subscription.count({
      where: { is_active: true },
    });

    // Get all subscriptions with tenant counts
    const subscriptions = await Subscription.findAll({
      attributes: ["id", "name", "price", "is_active"],
    });

    const statsPromises = subscriptions.map(async (sub) => {
      const totalTenants = await Tenants.count({
        where: { plan_id: sub.id },
      });

      const activeTenants = await Tenants.count({
        where: { plan_id: sub.id, is_active: true },
      });

      const revenue = parseFloat(sub.price) * activeTenants;

      return {
        plan_id: sub.id,
        plan_name: sub.name,
        price: parseFloat(sub.price),
        is_active: sub.is_active,
        total_tenants: totalTenants,
        active_tenants: activeTenants,
        monthly_revenue: revenue,
      };
    });

    const planStats = await Promise.all(statsPromises);

    // Total revenue across all plans
    const totalRevenue = planStats.reduce(
      (sum, stat) => sum + stat.monthly_revenue,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        total_plans: totalPlans,
        active_plans: activePlans,
        inactive_plans: totalPlans - activePlans,
        total_monthly_revenue: totalRevenue.toFixed(2),
        plan_statistics: planStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getTenantsByPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, is_active = "" } = req.query;

    // Check if subscription exists
    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    // Build where clause
    const whereClause = { plan_id: id };

    if (is_active !== "") {
      whereClause.is_active = is_active === "true";
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get tenants
    const { count, rows: tenants } = await Tenants.findAndCountAll({
      where: whereClause,
      attributes: [
        "tenant_id",
        "restaurant_name",
        "subdomain",
        "email",
        "is_active",
        "is_payment_done",
        "end_date",
        "createdAt",
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: {
        subscription: {
          id: subscription.id,
          name: subscription.name,
          price: subscription.price,
        },
        tenants,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  toggleSubscriptionStatus,
  getSubscriptionStats,
  getTenantsByPlan,
};
*/
