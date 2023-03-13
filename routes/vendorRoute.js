const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const Items = require("../models/items.js");
const Vendor = require("../models/vendor.js");
const bcrypt = require("bcrypt");
const XMLHttpRequest = require("xhr2");
const http = new XMLHttpRequest();
require("dotenv").config();
const stripe = require("stripe")(process.env.SK);
router.use(express.json()); //sends data in form of json objects
router.use(express.urlencoded({ extended: false })); //body parse

router.use(express.static(__dirname));

const ensureLogin = function (req, res, next) {
  if (req.session.vendorid != null) {
    next();
  } else {
    res.redirect("/");
  }
};


const stripeExists = async (req,res,next) => {
  const vendor = await Vendor.findOne({username: req.session.vendorid})
  if(vendor.stripeExists)
  next();
  else
  res.render('venStr')
}



router.get("/", async (req, res) => {
  if (req.session.vendorid == null) {
    const regmsg = req.query.Registration;
    const isVerified = req.query.isVerified
    const password = req.query.password
    res.render("venHom", { regmsg , isVerified , password } );
  } else {
    res.redirect("/vendor/dashboard");
  }
});

//used for registration of vendor
router.post("/venReg", async (req, res) => {
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(req.body.password, salt);
  const VendorData = {
    email: req.body.email,
    mob: req.body.mob,
    username: req.body.username,
    password: hash,
  };
  const isAlreadyRegistered = await Vendor.findOne({ username: req.body.username });
  if (isAlreadyRegistered) {
    res.redirect("/vendor/?Registration=Failure");
  } else {
    await Vendor.insertMany([VendorData]);
    res.redirect("/vendor/");
  }
});

//used for login of vendor
router.post("/venLog", async (req, res) => {
  const user = await Vendor.findOne({ username: req.body.username });
  if (user) {
    const isVerified = await Vendor.findOne({
      username: req.body.username,
      isVerified: true,
    });
    if (await bcrypt.compare(req.body.password, user.password)) {
    if (isVerified) 
      {
        req.session.vendorid = req.body.username;
        res.redirect("/vendor/dashboard");
      } 
      else {
        res.redirect('/vendor/?isVerified=false');
      }
    }
      else {
        res.redirect('/vendor/?password=false');
    } 

  } else {
    res.send("vendor does not exists");
  }
});

router.get("/dashboard", ensureLogin, stripeExists, async (req, res) => {
  const vendor = await Vendor.findOne({username:req.session.vendorid})
  const items= await Items.find({vendorName: req.session.vendorid})
  const user = await User.find({ "orders.vendorName": req.session.vendorid });
  const len = user.length;
  let curord = [];
  for (let i = 0; i < len; i++) {
    const ord = user[i].orders;
    let lenord = ord.length;
    for (let j = 0; j < lenord; j++) {
      if (
        ord[j].isActive == true &&
        ord[j].isPaid == true &&
        ord[j].vendorName == req.session.vendorid
      ) {
        curord.push(ord[j]);
      }
    }
  }
  console.log(curord);
  const length = curord.length
  res.render("venDas", { vendor , items , curord , length });
});


router.post("/itemadd", ensureLogin , stripeExists, async (req, res) => {
  const vendor = await Vendor.findOne({ username: req.session.vendorid });
  const product = await stripe.products.create({
    name: req.body.itemName,
    default_price_data: {
      currency: "inr",
      unit_amount_decimal: req.body.itemPrice * 100,
    },
  });
  const price = await stripe.prices.create({
    product: product.id,
    currency: "inr",
    unit_amount: req.body.itemPrice * 100,
  });
  const ItemData = {
    vendorName: req.session.vendorid,
    itemName: req.body.itemName,
    itemPrice: req.body.itemPrice,
    vendorID: req.session.vendorid,
    productID: product.id,
    priceID: price.id,
    vendorAccountID: vendor.stripeID,
  };
  await Items.insertMany([ItemData]);
  Items.find({ vendorName: req.session.vendorid }, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      nm = "Welcome " + req.session.vendorid;
      res.redirect('/vendor/dashboard')
    }
  });
});

router.get("/logout", ensureLogin ,  (req, res) => {
  req.session.destroy();
  res.redirect('/')
});

router.get("/register", (req, res) => {
  if (req.session.vendorid == null) {
    const regmsg = req.query.Registration
    res.render("venReg" , {regmsg});
  } else {
    res.redirect("/vendor/dashboard");
  }
  }
);

router.get("/login", (req, res) => {
  if (req.session.vendorid == null) {
    res.render("venLog");
  } else {
    res.redirect("/vendor/dashboard");
  }
});



router.get("/credit", ensureLogin  ,stripeExists, async (req, res) => {
  const user = await User.find();
  var uslen = user.length;
  var ord = [];
  for (let i = 0; i < uslen; i++) {
    var ordlen = user[i].orders.length;
    for (let j = 0; j < ordlen; j++) {
      if (
        user[i].orders[j].isActive == false &&
        user[i].orders[j].isPaid == true &&
        user[i].orders[j].modeOfPayment == "credit" &&
        user[i].orders[j].creditOverdue == true
      )
        ord.push(user[i].orders[j]);
    }
  }
  res.render("venCrd", { ord });
});

router.get("/itemadd" , ensureLogin, stripeExists, (req, res) => {
  res.render("itemadd");
});

router.post("/delete/:id", ensureLogin, stripeExists, async (req, res) => {
  try {
    await Items.remove({ _id: req.params.id });
    Items.find({ vendorName: req.session.vendorid }, (err, items) => {
      if (err) {
        console.log(err);
      } else {
        nm = "Welcome " + req.session.vendorid;
        res.redirect('/vendor/dashboard');
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/change/:id", ensureLogin ,stripeExists, async (req, res) => {
  try {
    const val = await Items.findOne(
      { _id: req.params.id },
      { avail: 1, _id: 0 }
    );
    if (val.avail == true) {
      await Items.findByIdAndUpdate({ _id: req.params.id }, { avail: false });
    } else {
      await Items.findByIdAndUpdate({ _id: req.params.id }, { avail: true });
    }
    Items.find({ vendorName: req.session.vendorid }, (err, items) => {
      if (err) {
        console.log(err);
      } else {
        nm = "Welcome " + req.session.vendorid;
        res.redirect('/vendor/dashboard');
      }
    });
  } catch (err) {
    console.log(err);
  }
});



router.post("/complete/:id", ensureLogin, stripeExists,async (req, res) => {
  await User.updateMany(
    { "orders._id": req.params.id },
    {
      $set: {
        "orders.$.isActive": false,
      },
    }
  );
  res.redirect("/vendor/dashboard");
});

router.get("/pastorders", ensureLogin, stripeExists,async (req, res) => {
  console.log(req.session.vendorid);
  const user = await User.find({ "orders.vendorName": req.session.vendorid });
  const len = user.length;
  let pastord = [];
  for (let i = 0; i < len; i++) {
    const ord = user[i].orders;
    let lenord = ord.length;
    for (let j = 0; j < lenord; j++) {
      if (
        ord[j].isActive == false &&
        ord[j].isPaid == true &&
        ord[j].vendorName == req.session.vendorid
      ) {
        pastord.push(ord[j]);
      }
    }
  }
  console.log(pastord);
  res.render("venPasOrd", { pastord });
});

router.post("/acceptpayments", ensureLogin, async (req, res) => {
  const vendor = await Vendor.findOne({ username: req.session.vendorid });
  if (vendor.stripeID == "") {
    const account = await stripe.accounts.create({
      type: "standard",
      country: "IN",
      email: vendor.email,
    });
    await Vendor.updateOne(
      { username: req.session.vendorid },
      { stripeID: account.id , stripeExists : true}
       );
       res.redirect('back')
  } else {
    const vendor = await Vendor.findOne({ username: req.session.vendorid });
    const accountLink = await stripe.accountLinks.create({
      account: vendor.stripeID,
      refresh_url: "http://localhost:4000/vendor/dashboard",
      return_url: "http://localhost:4000/vendor/dashboard",
      type: "account_onboarding",
    });
    res.redirect(accountLink.url);
  }
});

router.get("*", async (req, res) => {
  res.render('nopage');
});




module.exports = router;

