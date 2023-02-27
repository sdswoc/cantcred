const express =require('express')
const router =express.Router()
const cookieParser = require('cookie-parser')
const sessions = require('express-session')
const { Vendor , Ver, Items, User } = require('./../models/models.js');
const Swal = require('sweetalert2');
require('dotenv').config()
const DB = process.env.DB

router.use(express.json())  //sends data in form of json objects
router.use(express.urlencoded({extended:false}))  //body parse

router.use(express.static(__dirname))

//cookie and sessionss
router.use(cookieParser())
const oneMonth = 1000 * 60 * 60 * 24 * 30;
router.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneMonth },
    resave: false 
}));





//used for registration of vendor 
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



//used for login of vendor 
router.post("/venLog",async (req,res) => {
    const user = await Vendor.findOne({username: req.body.username })
    if (user) {
        const flag = await Vendor.findOne({flag:true}) 
        if (flag){
            const pass = await Vendor.findOne({password : req.body.password})
            if (pass){
                req.session.userid =req.body.username
                console.log(req.session)
                console.log(req.session.userid)
                nm = "Welcome " +req.session.userid
                res.render('venDas' , {nm})
            }
        else  {res.send("wrong password")}
        }
        else {res.send("Vendor not verified")}
    }
    else { res.send("vendor does not exists")
}})




//used for showing menu to vendor and also adding items 
router.get("/menu" , (req,res) => {
if (req.session.userid != null){
    Items.find({} , (err, items) => { 
    if(err){
        console.log(err)}
    else {
        nm = "Welcome " +req.session.userid
        router.post("/itemadd" , async(req,res) =>{
        console.log(req.session.userid)
        const ItemData = {
            vendorname: req.session.userid,
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
else {
    res.render('venLog')
}
})



router.get('/logout' , (req,res) => {
    if (req.session.userid != null){
    req.session.destroy();
    res.render("venHom")}
    else {res.render("venLog")}
})




router.get('/register' , (req,res) => {
    if (req.session.userid == null){
    res.render('venReg')}
    else {res.render('venDas')}
})




router.get('/login', (req, res) => {
    if (req.session.userid == null){
    res.render('venLog');}
    else {res.render('venDas')}
});




router.get('/', (req, res) => {
    if (req.session.userid == null){
  res.render('venHom'); }
  else {res.render('venDas')}
})




router.get('/credits', (req, res) => {
    if (req.session.userid != null){
    res.render('venCrd');}
    else {res.render('venLog')}
});




router.get('/orders', (req, res) => {
    if (req.session.userid != null){
    res.render('venOrd');}
    else {res.render('venLog')}
});



module.exports = router