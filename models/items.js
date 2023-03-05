const mongoose = require("mongoose"); //imports mongoose

const itemSchema = new mongoose.Schema({
  vendorName: { type: String, default: "" },
  itemName: { type: String, required: true },
  itemPrice: Number,
  avail: { type: Boolean, default: true },
});

const Items = mongoose.model("items", itemSchema);

module.exports = Items;
