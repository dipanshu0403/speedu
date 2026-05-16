const paymentRoutes = require("express").Router();

const paymentController = require("../../controllers/payment/payment.controller");
const { authenticate, authorizeRoles } = require("../../middleware/auth.middleware");
const adminOnly = [authenticate({ fetchUserFromDB: false }), authorizeRoles("admin")];

paymentRoutes.post("/create", paymentController.createPayment);

paymentRoutes.get("/all", adminOnly, paymentController.getPayments);

module.exports = paymentRoutes;
