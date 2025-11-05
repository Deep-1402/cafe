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
