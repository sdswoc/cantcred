const { ObjectId } = require("mongodb");
const mongoose = require("mongoose"); //imports mongoose

const itemSchema = new mongoose.Schema({
  vendorID: { type: String, default: "" },
  vendorName: { type: String, default: "" },
  itemName: { type: String, required: true },
  itemPrice: Number,
  avail: { type: Boolean, default: true },
  productID: String,
  priceID: String,
  vendorAccountID: String,
});

const Items = mongoose.model("items", itemSchema);

module.exports = Items;
