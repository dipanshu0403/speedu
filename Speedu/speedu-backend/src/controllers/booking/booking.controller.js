const bookingModel = require("../../models/booking.model");
const CustomerModel = require("../../models/customer.model");
const agentModel = require("../../models/agent.model");
const serviceModel = require("../../models/service.model");
const logger = require("../../utils/logger");

const GST_RATE = 18;
const PLATFORM_FEE_RATE = 10;

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function calculateAgentEarning(price) {
  const grossAmount = roundMoney(price);
  const gstAmount = roundMoney((grossAmount * GST_RATE) / 100);
  const platformFee = roundMoney((grossAmount * PLATFORM_FEE_RATE) / 100);
  const agentIncome = roundMoney(Math.max(grossAmount - gstAmount - platformFee, 0));

  return {
    grossAmount,
    gstRate: GST_RATE,
    gstAmount,
    platformFeeRate: PLATFORM_FEE_RATE,
    platformFee,
    agentIncome,
    settledAt: new Date(),
  };
}

function serviceIdsForAgent(agent) {
  return (agent?.services || []).map((serviceId) => String(serviceId));
}

exports.createBooking = async (req, res) => {
  try {
    logger.info("createBooking api called");

    const {
      customerId,
      serviceId,
      variantId,
      bookingDate,
      bookingTime,
      addressId,
    } = req.body;

    const customer = await CustomerModel.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "customer not found",
      });
    }

    const service = await serviceModel.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "service not found",
      });
    }

    const variant = service.variants.id(variantId);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "variant not found",
      });
    }

    const customerAddress = customer.address.id(addressId);

    if (!customerAddress) {
      return res.status(404).json({
        success: false,
        message: "address not found",
      });
    }

    const booking = await bookingModel.create({
      customerId,
      agentId: null,
      serviceId,
      variantId,
      serviceName: service.categoryName,
      variantName: variant.variantName,
      bookingDate,
      bookingTime,
      address: customerAddress,
      price: variant.variantPrice,
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "booking created successfully",
      data: booking,
    });
  } catch (error) {
    logger.error("Error", error);

    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    logger.info("getAllBookings api called");

    const bookings = await bookingModel
      .find()
      .populate("customerId")
      .populate("agentId")
      .populate("serviceId");

    return res.status(200).json({
      success: true,
      message: "bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    logger.error("Error", error);

    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    logger.info("getBookingById api called");

    const { bookingId } = req.params;

    const booking = await bookingModel
      .findById(bookingId)
      .populate("customerId")
      .populate("agentId")
      .populate("serviceId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "booking fetched successfully",
      data: booking,
    });
  } catch (error) {
    logger.error("Error", error);

    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.getCustomerBookings = async (req, res) => {
  try {
    logger.info("getCustomerBookings api called");

    const { customerId } = req.params;

    const bookings = await bookingModel
      .find({ customerId })
      .populate("agentId")
      .populate("serviceId");

    return res.status(200).json({
      success: true,
      message: "customer bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    logger.error("Error", error);

    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.getAgentBookings = async (req, res) => {
  try {
    logger.info("getAgentBookings api called");

    const { agentId } = req.params;
    const agent = await agentModel.findById(agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "agent not found",
      });
    }

    const serviceIds = serviceIdsForAgent(agent);
    const pendingBookingsForAgent = serviceIds.length
      ? { agentId: null, status: "PENDING", serviceId: { $in: serviceIds } }
      : { _id: null };

    const bookings = await bookingModel
      .find({
        $or: [
          { agentId },
          pendingBookingsForAgent,
        ],
      })
      .populate("customerId")
      .populate("serviceId");

    return res.status(200).json({
      success: true,
      message: "agent bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    logger.error("Error", error);

    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.acceptBooking = async (req, res) => {
  try {
    logger.info("acceptBooking api called");

    const { bookingId } = req.params;
    const { agentId } = req.body;

    const booking = await bookingModel.findById(bookingId);
    const agent = await agentModel.findById(agentId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "booking not found",
      });
    }

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "agent not found",
      });
    }

    if (!serviceIdsForAgent(agent).includes(String(booking.serviceId))) {
      return res.status(403).json({
        success: false,
        message: "This service is not available in your agent profile.",
      });
    }

    if (booking.agentId && String(booking.agentId) !== String(agentId)) {
      return res.status(409).json({
        success: false,
        message: "booking already accepted by another agent",
      });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `booking cannot be accepted from ${booking.status} status`,
      });
    }

    booking.agentId = agentId;
    booking.status = "ACCEPTED";

    await booking.save();

    await agentModel.findByIdAndUpdate(agentId, {
      isAvailable: false,
    });

    return res.status(200).json({
      success: true,
      message: "booking accepted successfully",
      data: booking,
    });
  } catch (error) {
    logger.error("Error", error);

    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    logger.info("rejectBooking api called");

    const { bookingId } = req.params;

    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "booking not found",
      });
    }

    booking.status = "REJECTED";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "booking rejected successfully",
      data: booking,
    });
  } catch (error) {
    logger.error("Error", error);

    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.startBooking = async (req, res) => {
  try {
    logger.info("startBooking api called");

    const { bookingId } = req.params;

    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "booking not found",
      });
    }

    booking.status = "ONGOING";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "booking started successfully",
      data: booking,
    });
  } catch (error) {
    logger.error("Error", error);

    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.completeBooking = async (req, res) => {
  try {
    logger.info("completeBooking api called");

    const { bookingId } = req.params;

    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "booking not found",
      });
    }

    if (!booking.agentId) {
      return res.status(400).json({
        success: false,
        message: "booking must be accepted by an agent before completion",
      });
    }

    if (!["ACCEPTED", "ONGOING", "COMPLETED"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `booking cannot be completed from ${booking.status} status`,
      });
    }

    const alreadySettled = Boolean(booking.earningBreakdown?.settledAt);
    if (!alreadySettled) {
      booking.earningBreakdown = calculateAgentEarning(booking.price);
    }

    booking.status = "COMPLETED";
    booking.completedAt = booking.completedAt || new Date();

    await booking.save();

    if (booking.agentId) {
      const agentUpdate = { $set: { isAvailable: true } };
      if (!alreadySettled) {
        agentUpdate.$inc = {
          walletBalance: booking.earningBreakdown.agentIncome,
          totalEarnings: booking.earningBreakdown.agentIncome,
          totalCompletedServices: 1,
        };
      }

      await agentModel.findByIdAndUpdate(booking.agentId, agentUpdate);
    }

    return res.status(200).json({
      success: true,
      message: "booking completed successfully",
      data: booking,
    });
  } catch (error) {
    logger.error("Error", error);

    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    logger.info("cancelBooking api called");

    const { bookingId } = req.params;
    const { cancelReason } = req.body;

    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "booking not found",
      });
    }

    booking.status = "CANCELLED";
    booking.cancelReason = cancelReason;

    await booking.save();

    if (booking.agentId) {
      await agentModel.findByIdAndUpdate(booking.agentId, {
        isAvailable: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: "booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    logger.error("Error", error);

    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
}
