const mongoose = require("mongoose"); //imports mongoose

const vendorDetailsSchema = new mongoose.Schema({
  username: { type: String, default: "" }, // we will give username
  password: { type: String, default: "" }, //we will give password
  name: { type: String, default: "" },
  email: { type: String, default: "" },
  mob: { type: String, default: "" },
  isVerified: { type: Boolean, default: false },
});

const Vendor = mongoose.model("vendor", vendorDetailsSchema);

module.exports = Vendor;
