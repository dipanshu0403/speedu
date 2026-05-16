const paymentModel = require("../../models/payment.model");
const bookingModel = require("../../models/booking.model");
const logger = require("../../utils/logger");

exports.createPayment = async (req, res) => {
  try {
    logger.info("createPayment api called");

    const { bookingId, customerId, paymentMethod } = req.body;

    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "booking not found",
      });
    }

    const payment = await paymentModel.create({
      bookingId,
      customerId,
      amount: booking.price,
      paymentMethod,
      paymentStatus: "SUCCESS",
      transactionId: `TXN${Date.now()}`,
    });

    return res.status(201).json({
      success: true,
      message: "payment successful",
      data: payment,
    });
  } catch (error) {
    logger.error("Error", error);

    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await paymentModel
      .find()
      .populate("bookingId")
      .populate("customerId");

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    logger.error("Error", error);

    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};