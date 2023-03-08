const mongoose = require("mongoose"); //imports mongoose

const vendorDetailsSchema = new mongoose.Schema({
  username: { type: String, default: "" },
  password: { type: String, default: "" },
  email: { type: String, default: "" },
  mob: { type: String, default: "" },
  isVerified: { type: Boolean, default: false },
  stripeID: { type: String, default: "" },
});

const Vendor = mongoose.model("vendor", vendorDetailsSchema);

module.exports = Vendor;
