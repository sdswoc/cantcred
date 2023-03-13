const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const Items = require("../models/items.js");
const Vendor = require("../models/vendor.js");
require("dotenv").config();
const stripe = require("stripe")(process.env.SK);
var bodyParser = require("body-parser");
router.use(express.json()); //sends data in form of json objects
router.use(express.urlencoded({ extended: false })); //body parse

router.use(express.static(__dirname));

//middleware to ensure session is active and mobile number is verified
const ensureLogin = async function (req, res, next) {
  if (req.session.userid != null) {
    const user = await User.findOne({ enr: req.session.userid });
    const enrol = user.enr;
    if (user.mob) next();
    else res.redirect("/users/onboarding/?enrol=" + enrol);
  } else res.redirect("/");
};
// middleware to ensure that credit limit is set to 200
const ensurePrice = async function (req, res, next) {
  const user = await User.findOne({ enr: req.session.userid });
  if (user.credit - req.session.price < 0) {
    res.redirect("http://localhost:4000/users/cart/?creditLim=true");
  } else {
    next();
  }
};

//login of student via channeli
router.get("/", (req, res) => {
  if (req.session.userid == null) {
    res.redirect("/../channeli");
  } else {
    const enrol = req.session.userid;
    res.redirect("/users/onboarding/?enrol=" + enrol);
  }
});

//onboarding of student for mobile verification
router.get("/onboarding", async (req, res, next) => {
  const enrol = req.query.enrol;
  req.session.userid = enrol;
  const user = await User.findOne({ enr: enrol });
  if (user) {
    if (!user.isVerified) {
      res.render("usOnb");
    } else {
      res.redirect("/users/dashboard");
    }
  } else {
    res.redirect("/users");
  }
});

//updating number after onboarding
router.post("/number", async (req, res) => {
  const mob = await User.findOne({ mob: req.body.number });
  if (!mob) {
    await User.updateOne(
      { enr: req.session.userid },
      { mob: req.body.number, isVerified: true }
    );
    res.redirect("/users/dashboard");
  } else {
    const alreadyExists = true;
    res.render("usOnb", { alreadyExists });
  }
});

//dashboard of the user
router.get("/dashboard", ensureLogin, async (req, res, next) => {
  const user = await User.findOne({ enr: req.session.userid });
  const vendors = await Vendor.find();
  var credit = user.credit;
  var name = user.name;
  var namesplit = name.split(" ");
  const msg = namesplit[0];
  res.render("usDas", { msg, credit, vendors }); //make the UI to show cards of vendors
});

//profile page of the user
router.get("/profile", ensureLogin, async (req, res) => {
  const user = await User.findOne({ enr: req.session.userid });
  var name = user.name;
  var namesplit = name.split(" ");
  const msg = namesplit[0];
  var len = user.orders.length,
    currOrdLen = 0,
    currOrd = [];
  for (let i = 0; i < len; i++) {
    if (user.orders[i].isActive == true && user.orders[i].isPaid == true) {
      currOrdLen++;
      currOrd.push(user.orders[i]);
    }
  }
  const credit = user.credit;
  res.render("usPrf", { user, msg, currOrdLen, currOrd, credit });
});

//menu of the user
router.get("/menu/", ensureLogin, (req, res, next) => {
  Items.find({ vendorName: req.query.vendorName }, (err, items) => {
    nm = "welcome " + req.session.userid;
    vendorName = req.query.vendorName;
    res.render("usMen", { items, nm, vendorName });
  });
});

//to show the all orders page
router.get("/orders", ensureLogin, async (req, res) => {
  const user = await User.findOne({ enr: req.session.userid });
  const ord = user.orders;
  res.render("usOrd", { ord });
});

// page to see all past credit transactions and refill credit
router.get("/credit", ensureLogin, async (req, res) => {
  const user = await User.findOne({ enr: req.session.userid });
  const credit = user.credit;
  var ord = [];
  var pastord = [];
  var len = 0;
  if (user.orders) {
    len = user.orders.length;
  }
  for (let i = 0; i < len; i++) {
    if (
      user.orders[i].isActive == false &&
      user.orders[i].isPaid == true &&
      user.orders[i].creditOverdue == true
    ) {
      ord.push(user.orders[i]);
    }
    if (
      user.orders[i].isActive == false &&
      user.orders[i].isPaid == true &&
      user.orders[i].creditOverdue == false &&
      user.orders[i].modeOfPayment == "credit"
    ) {
      pastord.push(user.orders[i]);
    }
  }
  res.render("usCre", { credit, ord, pastord });
});

//shows the cart of the user , we determine the price of the items which are only in the cart , to be in cart , order must be not paid , but shall be active
router.get("/cart", ensureLogin, async (req, res) => {
  var credmsg = false;
  if (req.query.creditLim) {
    credmsg = req.query.creditLim;
  }
  const user = await User.findOne({
    enr: req.session.userid,
    "orders.isPaid": false,
    "orders.isActive": true,
  });
  var isExists;
  if (user) {
    const ord = user.orders;
    const len = ord.length;
    const credit = user.credit;
    var pr = 0;
    var isExists = true;
    for (let i = 0; i < len; i++) {
      if (ord[i].isActive == true && ord[i].isPaid == false) {
        pr += ord[i].totalPrice;
      }
    }
    req.session.price = pr;
    res.render("usCar", { ord, pr, isExists, credmsg, credit });
  } else {
    isExists = false;
    res.render("usCar", { isExists });
  }
});


//destroys sessoin
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/../");
});

// adds orders to the cart of the user, we add only the item specified using $push , code can be modified here
router.post("/book/:id", ensureLogin, async (req, res) => {
  if (req.body.quantity <= 0) {
  } else {
    var check = 0;
    const item = await Items.findOne({ _id: req.params.id });
    const user = await User.findOne({ enr: req.session.userid });
    var len = 0;
    if (user) {
      len = user.orders.length;
    }
    if (len == 0) {
      await User.updateMany(
        { enr: req.session.userid },
        {
          $push: {
            //adds the first order
            orders: {
              itemName: item.itemName,
              itemPrice: item.itemPrice,
              vendorName: item.vendorName,
              quantity: req.body.quantity,
              totalPrice: req.body.quantity * item.itemPrice,
              userName: user.name,
              userEnr: user.enr,
              productID: item.productID,
              priceID: item.priceID,
              vendorAccountID: item.vendorAccountID,
              itemID: item._id,
            },
          },
        }
      );
    } else {
      for (let i = 0; i < len; i++) {
        if (
          user.orders[i].itemID == item._id &&
          user.orders[i].isPaid == false
        ) {
          check = 1;
          break;
        }
      }
      if (user.orders[len - 1].vendorName == item.vendorName && check == 0) {
        await User.updateMany(
          { enr: req.session.userid },
          {
            $push: {
              orders: {
                itemName: item.itemName,
                itemPrice: item.itemPrice,
                vendorName: item.vendorName,
                quantity: req.body.quantity,
                totalPrice: req.body.quantity * item.itemPrice,
                userName: user.name,
                userEnr: user.enr,
                productID: item.productID,
                priceID: item.priceID,
                vendorAccountID: item.vendorAccountID,
                itemID: item._id,
              },
            },
          }
        );
      } else {
        if (user.orders[len - 1].isActive == false && check == 0) {
          await User.updateMany(
            { enr: req.session.userid },
            {
              $push: {
                orders: {
                  itemName: item.itemName,
                  itemPrice: item.itemPrice,
                  vendorName: item.vendorName,
                  quantity: req.body.quantity,
                  totalPrice: req.body.quantity * item.itemPrice,
                  userName: user.name,
                  userEnr: user.enr,
                  productID: item.productID,
                  priceID: item.priceID,
                  vendorAccountID: item.vendorAccountID,
                  itemID: item._id,
                },
              },
            }
          );
        } else {
        }
      }
    }
    res.redirect("back");
  }
});

// deletes an item from the cart of the user
router.post("/cart/delete/:id", ensureLogin, async (req, res) => {
  await User.updateMany(
    { enr: req.session.userid },
    {
      $pull: {
        orders: { _id: req.params.id },
      },
    }
  );
  res.redirect("/users/cart");
});

// sends request to  stripe
router.post("/paynow", ensureLogin, async (req, res) => {
  var orders = [];
  var ordord = [];
  const user = await User.findOne({
    enr: req.session.userid,
  });
  const ord = user.orders;
  const len = ord.length;
  for (let i = 0; i < len; i++) {
    if (ord[i].isActive == true && ord[i].isPaid == false) {
      const or = { price: ord[i].priceID, quantity: ord[i].quantity };
      const orr = {
        id: ord[i]._id,
        user: ord[i].userEnr,
      };
      orders.push(or);
      ordord.push(orr);
    }
  }
  const ordd = JSON.stringify(ordord);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      orders[0],
      orders[1],
      orders[2],
      orders[3],
      orders[4],
      orders[5],
      orders[6],
      orders[7],
      orders[8],
      orders[9],
      orders[10],
      orders[11],
      orders[12],
      orders[13],
      orders[14],
      orders[15],
      orders[16],
      orders[17],
      orders[18],
      orders[19],
      orders[20],
      orders[21],
      orders[22],
      orders[23],
      orders[24],
      orders[25],
      orders[26],
    ],
    payment_intent_data: {
      transfer_data: { destination: ord[len - 1].vendorAccountID },
    },
    metadata: { ordd },
    success_url: "http://localhost:4000/users/dashboard",
    cancel_url: "http://localhost:4000/users/dashboard",
  });
  res.redirect(session.url);
});

//webhook
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event = req.body;

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;
        const data = checkoutSessionCompleted.metadata;
        const dat = JSON.parse(data.ordd);
        var enrol, len;
        if (!dat.length) {
          const user = await User.findOne({ enr: dat.user });
          for (let i = 0; i < user.orders.length; i++) {
            if (user.orders[i]._id == dat.id) {
              var newCredit = user.credit;
              var Datex = Date.now();
              if (user.orders[i].modeOfPayment == "credit") {
                var newCredit = user.credit + user.orders[i].totalPrice;
                Datex = user.orders[i].orderedAt;
              }
              await User.updateMany(
                { enr: dat.user, "orders._id": dat.id },
                {
                  $set: {
                    "orders.$.isPaid": true,
                    "orders.$.orderedAt": Datex,
                    "orders.$.creditOverdue": false,
                    "orders.$.creditPaidAt": Date.now(),
                    credit: newCredit,
                  },
                }
              );
            }
          }
        } else {
          const user = await User.findOne({ enr: dat[0].user });
          for (let i = 0; i < user.orders.length; i++) {
            for (let j = 0; j < dat.length; j++) {
              if (user.orders[i]._id == dat[j].id) {
                var newCredit = user.credit;
                if (user.orders[i].modeOfPayment == "credit") {
                  var newCredit = user.credit + user.orders[i].itemPrice;
                }
                await User.updateMany(
                  { enr: dat[j].user, "orders._id": dat[j].id },
                  {
                    $set: {
                      "orders.$.isPaid": true,
                      "orders.$.orderedAt": Date.now(),
                      "orders.$.creditOverdue": false,
                      "orders.$.creditPaidAt": Date.now(),
                      credit: newCredit,
                    },
                  }
                );
              }
            }
          }
        }

        break;
      // ... handle other event types
      default:
    }
    // Return a 200 response to acknowledge receipt of the event
    res.send();
  }
);

// this is to pay items using a credit system
router.post("/paycred", ensureLogin, ensurePrice, async (req, res) => {
  const user = await User.findOne({ enr: req.session.userid });
  const ord = user.orders;
  const len = ord.length;
  var pr = 0;
  for (let i = 0; i < len; i++) {
    if (ord[i].isActive == true && ord[i].isPaid == false) {
      pr += ord[i].totalPrice;
      await User.updateMany(
        { enr: req.session.userid, "orders.isPaid": "false" },
        {
          $set: {
            "orders.$.isPaid": true,
            "orders.$.modeOfPayment": "credit",
            "orders.$.orderedAt": Date.now(),
            "orders.$.creditOverdue": true,
          },
        },
        { multi: true }
      );
    }
    var newcred = user.credit - pr;
    await User.updateMany({ enr: req.session.userid }, { credit: newcred });
  }
  res.redirect("/users/cart");
});

//refills credit of the user
router.post("/refillcredit/:id", ensureLogin, async (req, res) => {
  var or, c, ordd;
  const user = await User.findOne({
    enr: req.session.userid,
  });
  const len = user.orders.length;
  for (let i = 0; i < len; i++) {
    if (user.orders[i]._id == req.params.id) {
      or = { price: user.orders[i].priceID, quantity: user.orders[i].quantity };
      c = i;
      ordd = {
        price: user.orders[i].priceID,
        quantity: user.orders[i].quantity,
        id: user.orders[i]._id,
        user: user.orders[i].userEnr,
      };
    }
  }
  ordd = JSON.stringify(ordd);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [or],
    payment_intent_data: {
      transfer_data: { destination: user.orders[c].vendorAccountID },
    },
    metadata: { ordd },
    success_url: "http://localhost:4000/users/dashboard",
    cancel_url: "http://localhost:4000/users/dashboard",
  });
  res.redirect(session.url);
});

//if routes do not match, we show this page
router.get("*", async (req, res) => {
  res.render("nopage");
});

module.exports = router;
