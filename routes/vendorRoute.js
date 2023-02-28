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
                req.session.vendorid =req.body.username
                console.log(req.session)
                console.log(req.session.vendorid)
                nm = "Welcome " +req.session.vendorid
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
if (req.session.vendorid != null){
    Items.find({} , (err, items) => { 
    if(err){
        console.log(err)}
    else {
        nm = "Welcome " +req.session.vendorid
        res.render ("venMen" , {items , nm}) }
    })
}
else {
    res.render('venHom')
}
})

router.post("/itemadd" , async(req,res) =>{
    
    const ItemData = {
        vendorname: req.session.vendorid,
        itemname:req.body.itemname,
        itemprice:req.body.itemprice
        }
        Swal.fire({text : 'Added!'})
        await Items.insertMany([ItemData])    
        Items.find({} , (err, items) => { 
            if(err){
                console.log(err)}
            else {
                nm = "Welcome " +req.session.vendorid
                res.render ("venMen" , {items , nm}) }
            })
 })



router.get('/logout' , (req,res) => {
    if (req.session.vendorid != null){
    req.session.destroy();
    res.render("venHom")}
    else {res.render("venLog")}
})




router.get('/register' , (req,res) => {
    if (req.session.vendorid == null){
    res.render('venReg')}
    else {res.render('venDas')}
})




router.get('/login', (req, res) => {
    if (req.session.vendorid == null){
    res.render('venLog');}
    else {res.render('venDas')}
});




router.get('/', (req, res) => {
    if (req.session.vendorid == null){
  res.render('venHom'); }
  else {res.render('venDas')}
})




router.get('/credits', (req, res) => {
    if (req.session.vendorid != null){
    res.render('venCrd');}
    else {res.render('venHom')}
});




router.get('/orders', (req, res) => {
    if (req.session.vendorid != null){
    res.render('venOrd');}
    else {res.render('venHom')}
});



router.get('/itemadd', (req,res) =>{
    if(req.session.vendorid != null){
        res.render('itemadd')
    }
    else{
        res.render('venHom')
    }
})


router.post('/delete/:id' , async (req,res) =>{
    if(req.session.vendorid != null){
    try {
        await Items.remove({_id: req.params.id})
        Items.find({} , (err, items) => { 
            if(err){
                console.log(err)}
            else {
                nm = "Welcome " +req.session.vendorid
                res.render ("venMen" , {items , nm}) }
            })
    } catch (err) {
        console.log(err)
    }}
    else {
        res.render('venHom')
    }   
    })






module.exports = router