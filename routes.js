const express = require('express');
const app = express()
const router = express.Router();
const { Vendor , Ver, Items, User } = require('./models/models.js');
const mongoose = require('mongoose')
const Swal = require('sweetalert2')
require('dotenv').config()
const DB = process.env.DB

app.use(express.json())  //sends data in form of json objects
app.use(express.urlencoded({extended:false}))  //body parse

mongoose.set('strictQuery',true) //used this for depreciation warning

//connecting to database 
mongoose.connect(DB,{useNewUrlParser : true})
   .then(() => console.log("Database connected"))
   .catch((err) => console.log(err))

// Home page route.
router.get('/', (req, res) => {
  res.render('home');
});

//registers vendor
router.post("/venReg",async (req,res) => {
    const VendorData = { 
        name : req.body.name,
        email : req.body.email,
        mob : req.body.mob,
        username : "########",
        password : "########",
    }
    await Vendor.insertMany([VendorData])
    res.render('venDas')
})

//checks authentication for vendor and then displays menu 
router.post("/venLog",async (req,res) => {
    const user = await Vendor.findOne({username: req.body.username })
    if (user) {
        const flag = await Vendor.findOne({flag:true}) 
        if (flag){
            const pass = await Vendor.findOne({password : req.body.password})
            if (pass){
                nm = "Welcome " +req.body.username
                Items.find({} , (err, items) => { 
                    if(err){
                        console.log(err)}
                    else {
                        router.post("/itemadd" , async(req,res) =>{
                            const ItemData = {
                                itemname:req.body.itemname,
                                itemprice:req.body.itemprice
                            }
                            Swal.fire({text : 'Added!'})
                            await Items.insertMany([ItemData])    
                            res.send("Item Succesfully Added")
                        })
                        res.render ("venMen" , {items , nm})}
                })
            }
        else  {res.send("wrong password")}
        }
        else {res.send("Vendor not verified")}
    }
    else { res.send("vendor does not exists")
}})

/*router.post("/itemadd" , async(req,res) =>{
    const ItemData = {
        itemname:req.body.itemname,
        itemprice:req.body.itemprice
    }
    await Items.insertMany([ItemData])
})*/


router.post("/usReg", async (req,res) =>{
    const UserData = {
        name:req.body.name,
        email: req.body.email,
        mob : req.body.mob,
        enr: req.body.enr,
        password : req.body.password
    }
    const enr = await Ver.findOne({enr: req.body.enr})
    if(enr){
       await User.insertMany([UserData])
        const msg = "succesfully registered"
        res.render('usHom', {msg})
    }
    else {
         res.send("first verify")
    }
})

router.post("/usLog" , async (req,res) =>{
    const user = await User.findOne({enr: req.body.username})
    if (user) {
        console.log("user exists")
        const pass = await User.findOne({password : req.body.password})
        if (pass)
        {
            const msg = "welcome " +req.body.username
            console.log("Correct password")
            res.render('usDas', {msg})
        }
        else  {res.send("wrong password")}
    }
    else { res.send('user does not exists')}
})

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

router.get('/vendor', (req, res) => {
  
     res.render('venDas');
   
})

router.get('/vendor/credit', (req, res) => {
    res.render('venCrd');
});

router.get('/vendor/orders', (req, res) => {
    res.render('venOrd');
});

router.get('/users/home', (req,res) =>{
    res.render('usHom');
})

router.get('/users/login', (req, res) => {
    res.render('usLog');
});

router.get('/users/register', (req, res) => {
    res.render('usReg');
});


//router.post(/usLog)
//router.post(/usReg)

router.get('/users/dashboard', (req, res) => {
    res.render('usDas');
});

router.get('/users/menu', (req, res) => {
    Items.find({} , (err, items) => { 
      res.render('usMen', {items});})
});

router.get('/users/checkout', (req, res) => {
    res.render('usche');
});

router.get('/users/orders ', (req,res) => {
    res.render('usOrd')
})



module.exports = router;
