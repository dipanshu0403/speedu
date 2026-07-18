const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        mobile: {
            type: String,
            required: false,
            unique: true,
            sparse: true,
            match: /^(\+91|0)?[6789]\d{9}$/,
        },
        email: {
            type: String,
            required: false,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isFreeze: {
            type: Boolean,
            default: false
        },
        isBlock: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
            required: true,
        },
        role: {
            type: String,
            enum: ["customer", "agent"],
            required: true,
        },
        ipAddress: {
            type: String,
        },
        accessToken: {
            type: String,
        },
        refreshToken: {
            type: String,
            // required: true
        },
        otp: {
            type: String,

        },
        otpExpiresAt: {
            type: Date,
        },
        isProfileCompleted: {
            type: Boolean,
            default: false 
        }

    },
    {
        timestamps: true,
    }
);

const UserModel = mongoose.model("user", userSchema);

async function ensureUserAuthIndexes() {
    const indexes = await UserModel.collection.indexes().catch((error) => {
        if (error.codeName === "NamespaceNotFound") return [];
        throw error;
    });

    const mobileIndex = indexes.find((index) => index.key?.mobile === 1);
    const hasMobileIndex = mobileIndex?.unique && mobileIndex.sparse;
    if (mobileIndex && !hasMobileIndex) {
        await UserModel.collection.dropIndex(mobileIndex.name);
    }

    const emailIndex = indexes.find((index) => index.key?.email === 1);
    const hasEmailIndex = emailIndex?.unique && emailIndex.sparse;
    if (emailIndex && !hasEmailIndex) {
        await UserModel.collection.dropIndex(emailIndex.name);
    }

    if (!hasMobileIndex) {
        await UserModel.collection.createIndex({ mobile: 1 }, { unique: true, sparse: true, name: "mobile_1" });
    }
    if (!hasEmailIndex) {
        await UserModel.collection.createIndex({ email: 1 }, { unique: true, sparse: true, name: "email_1" });
    }
}

module.exports = UserModel;
module.exports.ensureUserAuthIndexes = ensureUserAuthIndexes;

