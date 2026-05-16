const bookingRoutes = require("express").Router();

const bookingController = require("../../controllers/booking/booking.controller");
const { authenticate, authorizeRoles } = require("../../middleware/auth.middleware");
const adminOnly = [authenticate({ fetchUserFromDB: false }), authorizeRoles("admin")];

bookingRoutes.post(
  "/create",
  bookingController.createBooking
);

bookingRoutes.get(
  "/all",
  adminOnly,
  bookingController.getAllBookings
);

bookingRoutes.get(
  "/:bookingId",
  bookingController.getBookingById
);

bookingRoutes.get(
  "/customer/:customerId",
  bookingController.getCustomerBookings
);

bookingRoutes.get(
  "/agent/:agentId",
  bookingController.getAgentBookings
);

bookingRoutes.patch(
  "/accept/:bookingId",
  bookingController.acceptBooking
);

bookingRoutes.patch(
  "/reject/:bookingId",
  bookingController.rejectBooking
);

bookingRoutes.patch(
  "/start/:bookingId",
  bookingController.startBooking
);

bookingRoutes.patch(
  "/complete/:bookingId",
  bookingController.completeBooking
);

bookingRoutes.patch(
  "/cancel/:bookingId",
  bookingController.cancelBooking
);

module.exports = bookingRoutes;
