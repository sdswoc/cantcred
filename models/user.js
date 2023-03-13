const { ObjectId } = require("mongodb");
const mongoose = require("mongoose"); //imports mongoose

const userDetailsSchema = new mongoose.Schema({
  name: { type: String },
  enr: { type: String, unique: true },
  email: { type: String, unique: true, default: "" },
  mob: { type: String},
  isVerified : {type: Boolean , default: false},
  credit: { type: Number, default: 200 },
  orders: [
    {
      isPaid: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
      itemName: { type: String, default: "" },
      itemPrice: { type: Number, default: 0 },
      quantity: { type: Number, default: 0 },
      totalPrice: { type: Number, default: 0 },
      vendorName: { type: String, default: "" },
      userName: { type: String, default: "" },
      userEnr: { type: String, default: "" },
      orderedAt: { type: Date, default: "" },
      modeOfPayment: {
        type: String,
        default: "direct",
        enum: ["credit", "direct"],
      },
      creditOverdue: { type: Boolean, default: true },
      creditPaidAt: { type: Date, default: "" },
      productID: String,
      priceID: String,
      vendorAccountID: String,
      itemID: String,
    },
  ],
});

const User = mongoose.model("user", userDetailsSchema);

module.exports = User;
