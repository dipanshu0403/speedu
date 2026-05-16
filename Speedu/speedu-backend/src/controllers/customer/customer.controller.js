const CustomerModel = require("../../models/customer.model");
const serviceModel = require("../../models/service.model");
const logger = require("../../utils/logger");

exports.customerProfile = async (req, res, next) => {
  try {
    // console.log(req.params);
    const { userId } = req.params;
    // console.log("userid", userId);
    const { fullName, email, gender, dob } = req.body;

    let profileLink = null 
    if(req.file){
      profileLink = `/uploads/${req.file.filename}`
    }
    console.log(req.file,req.file.filename,profileLink);
    

    const userProfile = await CustomerModel.create({ userId, fullName, email, gender, dob,profileLink });
    return res.status(200).json({
      success: true,
      message: "Customer profile created successfully",
      data: userProfile,
    });
  } catch (error) {
    logger.error("Error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create customer profile",
    });
  }
};

exports.updateCustomerProfile = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { fullName, email, gender, dob } = req.body;

    const customer = await CustomerModel.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found",
      });
    }

    if (fullName) customer.fullName = fullName;
    if (email) customer.email = email;
    if (gender) customer.gender = gender;
    if (dob) customer.dob = dob;

    if (req.file) {
      customer.profileLink = `/uploads/${req.file.filename}`;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Customer profile updated successfully",
      data: customer,
    });

  } catch (error) {
    logger.error("Error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update customer profile",
    });
  }
};


exports.customerAddresses = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { line1, line2, city, state, pincode } = req.body;
    const customer = await CustomerModel.findOne({ _id: customerId });
    if (!customer) {
      return res.status(404).json({ success: false, message: "user not found" });
    }
    customer.address.push({ line1, line2, city, state, pincode });
    await customer.save();
    return res
      .status(200)
      .json({ success: true, message: "Address added successfully", data: customer.address });
  } catch (error) {
    logger.error("error", error);
    return res.status(500).json({ success: false, message: "internal server error" });
  }
};
exports.updateCustomerAddress = async (req, res) => {
  try {
    const { customerId, addressId } = req.params;
    console.log(customerId, addressId);

    const { line1, line2, city, state, pincode } = req.body;

    const result = await CustomerModel.updateOne(
      {
        _id: customerId,
        "address._id": addressId,
      },
      {
        $set: {
          "address.$.line1": line1,
          "address.$.line2": line2,
          "address.$.city": city,
          "address.$.state": state,
          "address.$.pincode": pincode,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "customer or Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteCustomerAddress = async (req, res) => {
  try {
    logger.info("deleteCustomerAddress api called");
    const {customerId,addressId} = req.params
    const customer = await CustomerModel.findById(customerId);
    if(!customer){
      return res.status(404).json({
        success: false,
        message: "customer not found"
      })
    }
    const address = customer.address.id(addressId)
    if(!address) {
      return res.status(404).json({
        success: false,
        message: "customer address not found"
      })
    }
    customer.address.pull(addressId)
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "customer address deleted successfully",
      data: customer.address
    })
  } catch(error) {
    logger.error("Error",error);
    return res.status(500).json({
      success: false,
      message: "internal server error"
    })
  }
}