const express = require('express');
const router = express.Router();
const { Vendor , User, Items } = require('./models/models.js');
const mongoose = require('mongoose')
const oauth = require('./oauth.js')
const Oauth2Stratergy = require('passport-oauth2')
require('dotenv').config()
const DB = process.env.DB

mongoose.set('strictQuery',true) //used this for depreciation warning

//connecting to database 
mongoose.connect(DB,{useNewUrlParser : true})
   .then(() => console.log("Database connected"))
   .catch((err) => console.log(err))

// Home page route.
router.get('/', (req, res) => {
  res.render('home');
});

// About page route.
router.get('/about', (req, res) => {
  res.render('about')
});

router.get('/vendor/register', (req, res) => {
    res.render('venReg');
});

router.get('/vendor/login', (req, res) => {
    res.render('venLog');
});

router.get('/vendor/dashboard', (req, res) => {
  
     res.render('venDas');
   
})

router.get('/vendor/menu', (req, res) => {
    Items.find({}).then((x)=>{
    res.render('venMen', {data:x})
})
});

router.get('/vendor/credit', (req, res) => {
    res.render('venCrd');
});

router.get('/vendor/orders', (req, res) => {
    res.render('venOrd');
});

router.get('/users/login', (req, res) => {
    res.render('usLog');
});

router.get('/users/dashboard', (req, res) => {
    res.render('usDas');
});

router.get('/users/menu', (req, res) => {
    res.render('usMen');
});

router.get('/users/checkout', (req, res) => {
    res.render('usche');
});

router.get('/users/orders ', (req,res) => {
    res.render('usOrd')
})

//registers vendor
router.post("/venReg",async (req,res) => {
    const VendorData = { 
        name : req.body.name,
        email : req.body.email,
        mob : req.body.mob,
        username : "",
        password : "",
    }
    await Vendor.insertMany([VendorData])
    res.render('venDas')
     
})

//checks authentication for vendor
router.post("/venLog",async (req,res) => {
   try{ 
    const user = await Vendor.findOne({username: req.body.username})
    if (user) {
        console.log("user exists")
        const pass = await Vendor.findOne({password : req.body.password})
        if (pass)
        {
            console.log("Correct password")
            res.send("authentication succesful")
        }
    }
    else { res.send('user does not exists')}
   
}
catch(error){}
})


router.get('/channeli', oauth)

module.exports = router;
