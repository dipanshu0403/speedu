const mongoose = require("mongoose");
const agentModel = require("../../models/agent.model");
const UserModel = require("../../models/user.model");
const logger = require("../../utils/logger");
const serviceModel = require("../../models/service.model");
const { messaging } = require("firebase-admin");

function readSelectedServices(body) {
  const raw = body.services || body.serviceIds || body.selectedServices || [];
  const values = Array.isArray(raw) ? raw : [raw];
  return values
    .flatMap((value) => String(value || "").split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

async function validateSelectedServices(serviceIds) {
  const uniqueIds = [...new Set(serviceIds)];
  if (!uniqueIds.length) {
    return { error: "Please select at least one service." };
  }

  const invalidId = uniqueIds.find((id) => !mongoose.Types.ObjectId.isValid(id));
  if (invalidId) {
    return { error: "Invalid service selected." };
  }

  const count = await serviceModel.countDocuments({ _id: { $in: uniqueIds } });
  if (count !== uniqueIds.length) {
    return { error: "Selected service not found." };
  }

  return { serviceIds: uniqueIds };
}

exports.agentProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { fullName, email, gender, dob } = req.body;
    const selectedServices = await validateSelectedServices(readSelectedServices(req.body));
    if (selectedServices.error) {
      return res.status(400).json({ success: false, message: selectedServices.error });
    }

    const updateData = { userId };
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (gender) updateData.gender = gender;
    if (dob) updateData.dob = dob;
    updateData.services = selectedServices.serviceIds;
    if (req.file) {
      updateData.profileLink = `/uploads/${req.file.filename}`;
    }

    const userProfile = await agentModel.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    if (!userProfile) {
      return res.status(500).json({ success: false, message: "failed to create agent profile" });
    }

    await UserModel.findByIdAndUpdate(userId, { isProfileCompleted: true });

    return res
      .status(200)
      .json({ success: true, message: "agent profile saved successfully", data: userProfile });
  } catch (error) {
    logger.error("Error", error);
    return res.status(500).json({ success: false, message: "internal server error" });
  }
};
exports.updateAgentProfile = async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const agent = await agentModel.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "agent not found",
      });
    }

    if (req.body.fullName) agent.fullName = req.body.fullName;
    if (req.body.email) agent.email = req.body.email;
    if (req.body.dob) agent.dob = req.body.dob;
    if (req.body.gender) agent.gender = req.body.gender;
    const serviceFieldsPresent = req.body.services || req.body.serviceIds || req.body.selectedServices;
    if (serviceFieldsPresent) {
      const selectedServices = await validateSelectedServices(readSelectedServices(req.body));
      if (selectedServices.error) {
        return res.status(400).json({ success: false, message: selectedServices.error });
      }
      agent.services = selectedServices.serviceIds;
    }


     if (req.file) {
      agent.profileLink = `/uploads/${req.file.filename}`;
    }

    await agent.save();

    return res.status(200).json({
      success: true,
      message: "user profile updated successfully",
      data: agent,
    });
  } catch (error) {
    logger.error("Error", error);
    return res.status(500).json({ success: false, message: "internal server error" });
  }
};

exports.agentAddresses = async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const { line1, line2, city, state, pincode } = req.body;
    const agent = await agentModel.findOne({ _id: agentId });

    if (!agent) {
      return res.status(404).json({ success: false, message: "user not found" });
    }
    if (!agent.address) {
      agent.address = [];
      return res.status(404).json({
        success: false,
        message: "you have no address for update",
      });
    }
    agent.address.push({ line1, line2, city, state, pincode });
    await agent.save();
    return res
      .status(200)
      .json({ success: true, message: "Address added successfully", data: agent.address });
  } catch (error) {
    logger.error("error", error);
    return res.status(500).json({ success: false, message: "internal server error" });
  }
};

exports.updateAgentAddress = async (req, res, next) => {
  try {
    const { agentId, addressId } = req.params;
    const { line1, line2, city, state, pincode } = req.body;

    const updateFields = {};

    if (line1) updateFields["address.$.line1"] = line1;
    if (line2) updateFields["address.$.line2"] = line2;
    if (city) updateFields["address.$.city"] = city;
    if (state) updateFields["address.$.state"] = state;
    if (pincode) updateFields["address.$.pincode"] = pincode;

    const agentUpdateAdresses = await agentModel.findOneAndUpdate(
      { _id: agentId, "address._id": addressId },
      { $set: updateFields },
      { new: true }
    );

    if (!agentUpdateAdresses) {
      return res.status(404).json({
        success: false,
        message: "agent address not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "agent address updated successfully",
      data: agentUpdateAdresses,
    });
  } catch (error) {
    logger.error("Error", error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

exports.deleteAgentAdress = async (req, res) => {
  try {
    logger.info("deleteAgentAddress api called")
    const {agentId, addressId} = req.params
    const agent = await agentModel.findById(agentId)
    if(!agent) {
      return res.status(404).json({
      success: false,
      message: "agent not found"
    })
  }
    const address = agent.address.id(addressId)
    if(!address) {
      return res.status(404).json({
        success: false,
        message: "address not found"
      })
    }
    agent.address.pull(addressId)
    await agent.save();

    return res.status(200).json({
      success: true,
      message: "agent address deleted successfully",
      data: agent.address
    })
  } catch (error) {
    logger.error("Error",error)
    return res.status(500).json({
      success: false,
      message: "internal server error"
    })
  }
}
