const express =require('express')
const router =express.Router()
const cookieParser = require('cookie-parser')
const sessions = require('express-session')
const { Vendor , Ver, Items, User } = require('./../models/models.js');
require('dotenv').config()
const bcrypt = require('bcrypt')
const session = require('express-session');
const { MongoUnexpectedServerResponseError } = require('mongodb');

router.use(express.json())  //sends data in form of json objects
router.use(express.urlencoded({extended:false}))  //body parse

router.use(express.static(__dirname))
  





/*
//registers users
router.post("/usReg", async (req,res,next) =>{
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(req.body.password,salt)
    var UserData = {
        name:req.body.name,
        email: req.body.email,
        mob : req.body.mob,
        enr: req.body.enr,
        password: hash 
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



//used for user login
router.post("/usLog" , async (req,res) =>{
    const user = await User.findOne({enr: req.body.username})
    if (user) {
        console.log("user exists")
        if (await bcrypt.compare(req.body.password , user.password))
        {
            req.session.userid = req.body.username
            const msg = "welcome " +req.session.userid
            const user = await User.findOne({enr : req.session.userid})
            var credit =user.credit
            res.render('usDas', {msg, credit})
        }
        else {res.send("wrong password")}
    }
    else { res.send('user does not exists')}
})




router.get("/logout" ,(req,res) => {
    if (req.session.userid != null){
    req.session.destroy()
    res.render('usHom')}
    else {res.render('usLog')}
})
*/


router.get('/onboarding/',  async  (req,res) => {
   const enrol = req.query.enrol
   const user = await User.findOne({enr : enrol})
   console.log(user)
   if (user.mob == 0)
   {
    res.render('usOnb')
   }
   else
   {
    req.session.userid = user.enr
    res.render('usDas')
   }
})



router.get('/' , (req,res) => {
    if(req.session.userid == null)
    {
        res.redirect('/../channeli')
    }
    else
    {
        res.redirect('/users/dashboard')
    }
})









router.get('/home', (req,res) =>{
// if (req.session.userid == null){
    res.render('usHom');}
    //else {const msg = "Welcome " +req.session.userid;
    //res.render('usDas' , {msg})}
)




router.get('/login', (req, res,next) => {
    if(req.session.userid == null){
       res.render('usLog');
    }
    else {
        const msg = "Welcome " +req.session.userid;
        res.render('usDas' , {msg})
    }
});




router.get('/register', (req, res,next) => {
    if (req.session.userid == null){
       res.render('usReg');}
    else {
        msg = "welcome " + req.session.userid
        res.render('usDas' , {msg})}
});




router.get('/dashboard', async (req, res,next) => {
    if (req.session.userid != null){
        msg = "welcome " + req.session.userid 
        const user = await User.findOne({enr : req.session.userid})
         var credit =user.credit
       res.render('usDas', {msg, credit});}
    else {
        res.render('usHom')}
});




router.get('/menu', (req, res,next) => {
    if (req.session.userid != null){
       Items.find({} , (err, items) => { 
       nm = "welcome "+req.session.userid 
       var val = 1
       res.render('usMen', {items,nm,val});
    })
    }
    else {
        console.log("Not logged in ")
        res.render('usHom')
    }
});




router.get('/checkout', (req, res, next)=> {
    if (req.session.userid != null){
       res.render('usChe');
    }
    else {
        res.render('usHom')
    }
});




router.get('/orders', (req,res) => {
   if(req.session.userid != null){
      res.render('usOrd')}
    else 
      res.render('usHom')
})




router.get('/credits' , async (req,res) =>{
    if(req.session.userid != null){
        const user = await User.findOne({enr : req.session.userid})
         var credit =user.credit
        res.render('usCre' , {credit})
    }
    else {
        res.render('usHom')
    }
})



// adds orders to the cart of the user
router.post('/book/:id' , async(req,res) => {
    if(req.session.userid != null){                                                                    //checking if user is logged in
         const item = await Items.findOne({_id:req.params.id})                                         
         const user = await User.findOne({enr : req.session.userid})
         var len = user.orders.length
         console.log(len)
         if (len == 0)
         {
            await User.updateMany({enr : req.session.userid}, { $push : {                         //adds the first order
                orders : {
                    
                        itemname : item.itemname,
                        itemprice : item.itemprice,
                        vendorname : item.vendorname

                    }
            }
            })
         }
         else 
         {
            if (user.orders[0].vendorname == item.vendorname)
            {
                await User.updateMany({enr : req.session.userid}, { $push : {                       //adds other orders only if the vendor is same 
                    orders : {
                        
                            itemname : item.itemname,
                            itemprice : item.itemprice,
                            vendorname : item.vendorname
    
                        }
                }
                })
            }
            else{
               res.send("can only add one vendor")                                                        //does not add that order 
            }
 
         }
    }
    else {
         res.render('usHom')
    }   
 })



// deletes an item from the cart of the user
router.post('/cart/delete/:id' ,  async (req,res) =>{
    if (req.session.userid != null){
    await User.updateMany({enr:req.session.userid},{$pull :{ 
        orders: {_id : req.params.id}}})
        const user = await User.findOne({ enr:req.session.userid})
        const ord = user.orders
        const len = ord.length
        console.log(len)
        var pr = 0
        for ( let i = 0 ; i<len ; i++)
        {
            if(ord[i].isActive == true)
            {
                pr+= ord[i].itemprice;
            }
        }
        res.render('usCar' , {ord , pr})
    }
    else { res.render('usHom')}
})





 router.get('/cart' ,async (req,res) =>{
    if (req.session.userid != null){
    const user = await User.findOne({ enr:req.session.userid})
    const ord = user.orders
    const len = ord.length
    var pr = 0
    for ( let i = 0 ; i<len ; i++)
    {
        if(ord[i].isActive == true)
        {
            pr+= ord[i].itemprice;
        }
    }
    res.render('usCar' , {ord , pr})
    }
    else 
    {
        res.render('usHom')
    }
 })

  



module.exports = router