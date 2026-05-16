const { generateAccessToken, generateRefreshToken } = require("../middleware/auth.middleware");
const UserModel = require("../models/user.model");
const { generateOtp } = require("../utils/common.utils");
const logger = require("../utils/logger");  

/*
Signup API - Only mobile and role required
Generates static OTP and returns it in response
*/
exports.signup = async (req, res) => {
  try {
    logger.info("SignUp API called .....");
    const { mobile, role } = req.body;

    if (!mobile || !role) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and role are required",
      });
    }

    // Validate role
    if (!["customer", "agent"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'customer' or 'agent'",
      });
    }

    // Validate mobile format (10 digits)
    if (!/^[6789]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number format",
      });
    }

    const formattedMobile = `+91${mobile}`;
    const isExist = await UserModel.findOne({ mobile: formattedMobile });

    if (isExist) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this mobile number",
      });
    }

    // Generate OTP
    const otp = generateOtp(6);

    // Create new user with OTP
    const user = await UserModel.create({
      mobile: formattedMobile,
      role,
      otp,
      isProfileCompleted: false,
    });

    logger.info(`New user created: ${user._id} with mobile: ${formattedMobile}, OTP: ${otp}`);

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully. Please verify to continue.",
      data: {
        mobile: user.mobile,
        role: user.role,
        otp: otp, // Return OTP in response for development
      },
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
Login API - Only mobile and role required
Generates static OTP and returns it in response
*/
exports.login = async (req, res) => {
  try {
    logger.info("Login API called .....");
    const { mobile, role } = req.body;

    if (!mobile || !role) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and role are required",
      });
    }

    // Validate role
    if (!["customer", "agent"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'customer' or 'agent'",
      });
    }

    // Validate mobile format
    if (!/^[6789]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number format",
      });
    }

    const formattedMobile = `+91${mobile}`;
    const user = await UserModel.findOne({ mobile: formattedMobile });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    // Check if role matches
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Invalid role for this user",
      });
    }

    // Generate new OTP
    const otp = generateOtp(6);
    await UserModel.updateOne({ mobile: formattedMobile }, { otp });

    logger.info(`User login attempt: ${user._id} with mobile: ${formattedMobile}, OTP: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please verify to continue.",
      data: {
        mobile: user.mobile,
        role: user.role,
        otp: otp, // Return OTP in response for development
      },
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

// Verify OTP - Verify static OTP
/*
1. Verify static OTP
2. Check if user exists
3. Check if profile is completed
4. Generate JWT tokens
5. Send welcome email if new user
6. Send profile completion email if profile not completed
*/
exports.verifyOtp = async (req, res) => {
  try {
    logger.info(`Verify OTP API called.`);

    const { otp, mobile, role } = req.body;

    if (!otp || !mobile || !role) {
      return res.status(400).json({
        success: false,
        message: "OTP, mobile number, and role are required",
      });
    }

    const formattedMobile = `+91${mobile}`;
    const user = await UserModel.findOne({ mobile: formattedMobile });

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
      mobile: user.mobile,
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
      { accessToken, refreshToken, ipAddress: payload.ipAddress, otp: null }
    );

    logger.info(`OTP verified successfully for user: ${user._id}`);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        isProfileCompleted: user.isProfileCompleted,
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
