const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const Items = require("../models/items.js");
const Vendor = require("../models/vendor.js");
const Swal = require("sweetalert2");
require("dotenv").config();

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

router.get("/", async (req, res) => {
  if (req.session.vendorid == null) {
    res.render("venHom");
  } else {
    res.redirect("/vendor/dashboard");
  }
});

//used for registration of vendor
router.post("/venReg", async (req, res) => {
  const VendorData = {
    name: req.body.name,
    email: req.body.email,
    mob: req.body.mob,
    username: "########",
    password: "########",
  };
  await Vendor.insertMany([VendorData]);
  res.render("venDas");
});

//used for login of vendor
router.post("/venLog", async (req, res) => {
  const user = await Vendor.findOne({ username: req.body.username });
  if (user) {
    const isVerified = await Vendor.findOne({
      username: req.body.username,
      isVerified: true,
    });
    if (isVerified) {
      const pass = await Vendor.findOne({
        username: req.body.username,
        password: req.body.password,
      });
      if (pass) {
        req.session.vendorid = req.body.username;
        res.redirect("/vendor/dashboard");
      } else {
        res.send("wrong password");
      }
    } else {
      res.send("Vendor not verified");
    }
  } else {
    res.send("vendor does not exists");
  }
});

router.get("/dashboard", ensureLogin, async (req, res) => {
  const msg = "Welcome " + req.session.vendorid;
  res.render("venDas", { msg });
});

//used for showing menu to vendor and also adding items
router.get("/menu", ensureLogin, (req, res) => {
  Items.find({ vendorName: req.session.vendorid }, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      ven = req.session.vendorid;
      nm = "Welcome " + req.session.vendorid;
      res.render("venMen", { items, nm });
    }
  });
});

router.post("/itemadd", ensureLogin, async (req, res) => {
  const ItemData = {
    vendorName: req.session.vendorid,
    itemName: req.body.itemName,
    itemPrice: req.body.itemPrice,
  };
  await Items.insertMany([ItemData]);
  Items.find({ vendorName: req.session.vendorid }, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      nm = "Welcome " + req.session.vendorid;
      res.render("venMen", { items, nm });
    }
    Swal.fire({ text: "Added!" });
  });
});

router.get("/logout", ensureLogin, (req, res) => {
  req.session.destroy();
  res.render("venHom");
});

router.get("/register", (req, res) => {
  if (req.session.vendorid == null) {
    res.render("venReg");
  } else {
    res.render("venDas");
  }
});

router.get("/login", (req, res) => {
  if (req.session.vendorid == null) {
    res.render("venLog");
  } else {
    res.redirect("/vendor/dashboard");
  }
});

router.get("/", (req, res) => {
  if (req.session.vendorid == null) {
    msg = "Welcome " + req.session.vendorid;
    res.render("venHom", { msg });
  } else {
    res.redirect("/vendor/dashboard");
  }
});

router.get("/credit", ensureLogin, async (req, res) => {
  const user = await User.find()    
  var uslen = user.length
  var ord = []
  for (let i = 0 ; i <  uslen ; i++)
  {
    var ordlen =  user[i].orders.length
    for ( let j = 0 ; j < ordlen ; j++)
    {
      if (user[i].orders[j].isActive == false && user[i].orders[j].isPaid == true &&
        user[i].orders[j].modeOfPayment == "credit" && user[i].orders[j].creditOverdue == true)
        
      ord.push(user[i].orders[j])

    }
  }
  res.render("venCrd" , {ord});
});

router.get("/itemadd", ensureLogin, (req, res) => {
  res.render("itemadd");
});

router.post("/delete/:id", ensureLogin, async (req, res) => {
  try {
    await Items.remove({ _id: req.params.id });
    Items.find({ vendorName: req.session.vendorid }, (err, items) => {
      if (err) {
        console.log(err);
      } else {
        nm = "Welcome " + req.session.vendorid;
        res.render("venMen", { items, nm });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/change/:id", ensureLogin, async (req, res) => {
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
        res.render("venMen", { items, nm });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/currentorders", ensureLogin, async (req, res) => {
  console.log(req.session.vendorid);
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
  res.render("venCurOrd", { curord });
});

router.post("/complete/:id", ensureLogin, async (req, res) => {
  await User.updateMany(
    { "orders._id": req.params.id },
    {
      $set: {
        "orders.$.isActive": false,
      },
    }
  );
  res.redirect("/vendor/currentorders");
});

router.get("/pastorders", ensureLogin, async (req, res) => {
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

module.exports = router;

// const salt = await bcrypt.genSalt();
//const hash = await bcrypt.hash(req.body.password,salt)
