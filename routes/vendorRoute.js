const express =require('express')
const router =express.Router()
const cookieParser = require('cookie-parser')
const sessions = require('express-session')
const { Vendor , Ver, Items, User } = require('./../models/models.js');
const Swal = require('sweetalert2');
const { rawListeners } = require('gulp');
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
        const isVerified = await Vendor.findOne({username: req.body.username ,isVerified:true}) 
        if (isVerified){
            const pass = await Vendor.findOne({username: req.body.username ,password : req.body.password})
            if (pass){
                req.session.vendorid =req.body.username
                console.log(req.session)
                console.log(req.session.vendorid)
                msg = "Welcome " +req.session.vendorid
                res.render('venDas' , {msg})
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
    Items.find({vendorname: req.session.vendorid} , (err, items) => { 
    if(err){
        console.log(err)}
    else {
        ven = req.session.vendorid
        nm = "Welcome " +req.session.vendorid
        res.render('venMen' , {items , nm})
    }
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
       await Items.insertMany([ItemData])    
        Items.find({vendorname: req.session.vendorid} , (err, items) => { 
            if(err){
                console.log(err)}
            else {
                nm = "Welcome " +req.session.vendorid
                res.render ("venMen" , {items , nm}) }
                Swal.fire({text : 'Added!'})
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
        msg = "Welcome " + req.session.vendorid
  res.render('venHom' , {msg}); }
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
        Items.find({vendorname: req.session.vendorid} , (err, items) => { 
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



 router.post('/change/:id' , async(req,res) => {
    if(req.session.vendorid != null){
        try {
            const val = await Items.findOne({_id:req.params.id},{avail:1 , _id:0})
            if((val.avail) == true){
                await Items.findByIdAndUpdate({_id : req.params.id},{avail: false})
            }
            else {
                await Items.findByIdAndUpdate({_id : req.params.id},{avail: true})
            }
            Items.find({vendorname: req.session.vendorid} , (err, items) => { 
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


router.get('/currentorders' , async (req,res) => {
    if(req.session.vendorid != null){
    console.log(req.session.vendorid)
    const user = await User.find({"orders.vendorname" : req.session.vendorid})
    const len = user.length
    let curord = []
    for (let i = 0 ; i< len ; i++)
    {
    const ord = user[i].orders
    let lenord = ord.length
     for (let j = 0 ; j< lenord ; j++)
     {
        if (ord[j].isActive == true && ord[j].isPaid == true)
        {
        curord.push(ord[j])
        }
     }
    }
    console.log(curord)
    res.render('venCurOrd' , {curord})
    }
    else {
        res.render('venHom')
    }
})






router.post('/complete/:id' ,  async (req,res) =>{
    if(req.session.vendorid  != null) { 
    await User.updateMany({'orders._id' : req.params.id} , {'$set' :{
        'orders.$.isActive' : false }})
    res.redirect('/vendor/currentorders')
    } 
    else {
        res.render('venHom')
    }
} )





router.get('/pastorders' , async (req,res) => {
    if(req.session.vendorid != null){
        console.log(req.session.vendorid)
        const user = await User.find({"orders.vendorname" : req.session.vendorid})
        const len = user.length
        let pastord = []
        for (let i = 0 ; i< len ; i++)
        {
        const ord = user[i].orders
        let lenord = ord.length
         for (let j = 0 ; j< lenord ; j++)
         {
            if (ord[j].isActive == false && ord[j].isPaid == true)
            {
            pastord.push(ord[j])
            }
         }
        }
        console.log(pastord)
        res.render('venPasOrd' , {pastord})
        }
        else {
            res.render('venHom')
        }
    })

module.exports = router



 // const salt = await bcrypt.genSalt();
    //const hash = await bcrypt.hash(req.body.password,salt)