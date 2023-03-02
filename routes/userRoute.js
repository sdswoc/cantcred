const express =require('express')
const { MongoUnexpectedServerResponseError } = require('mongodb')
const mongoose = require('mongoose')
const router =express.Router()
const { Vendor , Ver, Items, User } = require('./../models/models.js')

require('dotenv').config()

router.use(express.json())  //sends data in form of json objects
router.use(express.urlencoded({extended:false}))  //body parse

router.use(express.static(__dirname))
  


router.get('/' , (req,res) => {
    if(req.session.userid == null) {
        res.redirect('/../channeli')
    }
    else {
        const enrol = req.session.userid
        res.redirect('/users/onboarding/?enrol='+enrol)
    }})

router.get('/onboarding/',  async  (req,res) => {
    if(req.session.userid != null) {
    const enrol = req.query.enrol  
    const user = await User.findOne({enr : enrol})
    if (user.mob == 0) {
     res.render('usOnb')
    }
    else {
     req.session.userid = user.enr
     msg = "Welcome " +req.session.userid
     res.render('usDas' , {msg})
    }
    }
    else {
      res.redirect('/')
    }
 })
 

router.get('/dashboard', async (req, res,next) => {
    if (req.session.userid != null){
        msg = "welcome " + req.session.userid 
        const user = await User.findOne({enr : req.session.userid})
         var credit =user.credit
       res.render('usDas', {msg, credit});}
    else {
        res.redirect('/')}
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
        res.redirect('/')
    }
});


router.get('/orders', async (req,res) => {
   if(req.session.userid != null){
      const user = await User.findOne({enr:req.session.userid})
      const ord = user.orders
      res.render('usOrd', {ord})}
    else 
      res.redirect('/')
})




router.get('/credits' , async (req,res) =>{
    if(req.session.userid != null){
        const user = await User.findOne({enr : req.session.userid})
         var credit =user.credit
        res.render('usCre' , {credit})
    }
    else {
        res.redirect('/')
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
         res.redirect('/')
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
    else { res.redirect('/')}
})





 router.get('/cart' ,async (req,res) =>{
    if (req.session.userid != null){

    const user = await User.findOne({  enr:req.session.userid,  "orders.isPaid":false ,"orders.isActive" : true})
    if (user){
    const ord = user.orders
    const len = ord.length
    var pr = 0
    for ( let i = 0 ; i<len ; i++)
    {
        if(ord[i].isActive == true && ord[i].isPaid == false)
        {
            pr+= ord[i].itemprice;
        }
    }
    res.render('usCar' , {ord , pr})
    }
    else { 
        res.render('usCar')
    }
    }
    else 
    {
        res.redirect('/')
    }
 })


router.get('/paypage' , (req,res) =>{
    res.send("this is the pay page")
}) 
  
router.get("/logout" ,(req,res) => {
    if (req.session.userid != null){
    req.session.destroy()
    res.redirect('/../')}
    else {res.redirect('/')}
})


//used for updating number after onboarding
router.post("/number" ,async (req,res) => {
    await User.updateOne ({enr : req.session.userid},{mob : req.body.number})
    res.redirect('/users/dashboard')
})



// will make this page after approval
router.post("/paynow" , async (req,res) => {
    res.send("This feature is now under construction")
})



// this is to pay items using a credit system 
router.post("/paycred" , async (req,res) => {
    if (req.session.userid != null){
       
       
       res.send("Your order has been sent to vendor")
       const user = await User.findOne({enr : req.session.userid})
       const ord = user.orders
       const len = ord.length
       var pr = 0
       for ( let i = 0 ; i<len ; i++)
       {await User.updateMany(
        {enr:req.session.userid , "orders.isPaid" : 'false' },{'$set' :{
            'orders.$.isPaid' : true }},                                                                          //this line updates the payment status to true for each order in cart
            {"multi" : true}
       )
           if(ord[i].isActive == true)
           {
               pr+= ord[i].itemprice;   
           }
       }
       var newcred = user.credit- pr;
       await User.updateMany({enr:req.session.userid} , {credit : newcred})
    }
    else {
        res.redirect('/')
    }
})




module.exports = router