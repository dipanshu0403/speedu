const { generateAccessToken, generateRefreshToken } = require("../middleware/auth.middleware");
const AgentModel = require("../models/agent.model");
const CustomerModel = require("../models/customer.model");
const UserModel = require("../models/user.model");
const { sendOtpEmail } = require("../services/email.service");
const { generateOtp, normalizeEmail } = require("../utils/common.utils");
const logger = require("../utils/logger");  

const OTP_EXPIRY_MINUTES = 5;

function createOtpPayload(otp) {
  return {
    otp,
    otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
  };
}

function otpResponseData(user, otp) {
  const data = {
    email: user.email,
    role: user.role,
  };

  if (process.env.NODE_ENV !== "production") {
    data.otp = otp;
  }

  return data;
}

async function sendOtpToUser(email, otp) {
  await sendOtpEmail(email, otp);
}

/*
Signup API - Only email and role required
Generates OTP and sends it to email
*/
exports.signup = async (req, res) => {
  try {
    logger.info("SignUp API called .....");
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: "Email and role are required",
      });
    }

    if (!["customer", "agent"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'customer' or 'agent'",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const isExist = await UserModel.findOne({ email: normalizedEmail });

    if (isExist) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const otpPayload = createOtpPayload(generateOtp(6));

    const user = await UserModel.create({
      email: normalizedEmail,
      role,
      ...otpPayload,
      isProfileCompleted: false,
    });

    await sendOtpToUser(normalizedEmail, otpPayload.otp);

    logger.info(`New user created: ${user._id} with email: ${normalizedEmail}`);

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully. Please verify to continue.",
      data: otpResponseData(user, otpPayload.otp),
    });
  } catch (error) {
    logger.error(`[Error] while sign-up: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/*
Login API - Only email and role required
Generates OTP and sends it to email
*/
exports.login = async (req, res) => {
  try {
    logger.info("Login API called .....");
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: "Email and role are required",
      });
    }

    if (!["customer", "agent"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'customer' or 'agent'",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Invalid role for this user",
      });
    }

    const otpPayload = createOtpPayload(generateOtp(6));
    await UserModel.updateOne({ email: normalizedEmail }, otpPayload);
    await sendOtpToUser(normalizedEmail, otpPayload.otp);

    logger.info(`User login OTP sent: ${user._id} with email: ${normalizedEmail}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please verify to continue.",
      data: otpResponseData(user, otpPayload.otp),
    });
  } catch (error) {
    logger.error(`[Error] while login: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    logger.info(`Verify OTP API called.`);

    const { otp, email, role } = req.body;

    if (!otp || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "OTP, email, and role are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    // Check role match
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Invalid role for this user",
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (user.otpExpiresAt && user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Check user status
    if (!user.isActive || user.isBlock) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive or blocked",
      });
    }

    // Generate JWT tokens
    const payload = {
      id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email || "",
      mobile: user.mobile || "",
      role: user.role,
      isActive: user.isActive,
      isFreeze: user.isFreeze,
      isBlock: user.isBlock,
      status: user.status,
      ipAddress: req.ip || req.connection.remoteAddress,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Clear OTP after successful verification
    await UserModel.updateOne(
      { _id: user._id },
      { accessToken, refreshToken, ipAddress: payload.ipAddress, otp: null, otpExpiresAt: null }
    );

    const profile =
      user.role === "agent"
        ? await AgentModel.findOne({ userId: user._id })
        : await CustomerModel.findOne({ userId: user._id });
    const profileData = profile
      ? { ...profile.toObject(), email: user.email, mobile: user.mobile, role: user.role }
      : null;

    logger.info(`OTP verified successfully for user: ${user._id}`);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        isProfileCompleted: user.isProfileCompleted,
        profileId: profile?._id || "",
        profile: profileData,
        userId: user._id,
        role: user.role,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error(`Error in verify OTP: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId || req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const profile =
      user.role === "agent"
        ? await AgentModel.findOne({ userId: user._id })
        : await CustomerModel.findOne({ userId: user._id });

    const profileData = profile
      ? { ...profile.toObject(), email: user.email, mobile: user.mobile, role: user.role }
      : null;

    return res.status(200).json({
      success: true,
      message: "Session is valid",
      data: {
        isProfileCompleted: user.isProfileCompleted,
        profileId: profile?._id || "",
        profile: profileData,
        userId: user._id,
        role: user.role,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    logger.error(`Error in getMe: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
