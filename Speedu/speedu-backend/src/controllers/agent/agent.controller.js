const { model } = require("mongoose");
const agentModel = require("../../models/agent.model");
const logger = require("../../utils/logger");
const serviceModel = require("../../models/service.model");
const { messaging } = require("firebase-admin");

exports.agentProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { fullName, email, gender, dob } = req.body;
    let profileLink = null;
    if (req.file) {
      profileLink = `/uploads/${req.file.filename}`;
    }
    const userProfile = await agentModel.create({ userId, fullName, email, gender, dob, profileLink });

    if (!userProfile) {
      return res.status(500).json({ success: false, message: "failed to create agent profile" });
    }
    return res
      .status(200)
      .json({ success: true, message: "agent profile created successfully", data: userProfile });
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
