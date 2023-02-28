const express =require('express')
const router =express.Router()
const cookieParser = require('cookie-parser')
const sessions = require('express-session')
const { Vendor , Ver, Items, User } = require('./../models/models.js');
require('dotenv').config()
const bcrypt = require('bcrypt')
const session = require('express-session')

router.use(express.json())  //sends data in form of json objects
router.use(express.urlencoded({extended:false}))  //body parse

router.use(express.static(__dirname))
  

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
       res.render('usMen', {items});
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


router.post('/book/:id' , async(req,res) => {
    if(req.session.userid != null){
       /* try {
            const val = await Items.findOne({_id:req.params.id},{avail:1 , _id:0})
            if((val.avail) == true){
                await Items.findByIdAndUpdate({_id : req.params.id},{avail: false})
            }
            else {
                await Items.findByIdAndUpdate({_id : req.params.id},{avail: true})
            }
            Items.find({} , (err, items) => { 
                if(err){
                    console.log(err)}
                else {
                    nm = "Welcome " +req.session.vendorid
                    res.render ("venMen" , {items , nm}) }
                })
        } catch (err) {
            console.log(err)
        }}*/
         console.log("added " +"to cart") 
         const item = await Items.findOne({_id:req.params.id})
         const price = item.itemprice;
         const user = await User.findOne({enr : req.session.userid})
         var credit =user.credit
         var newcredit = credit-price
         await User.findOneAndUpdate({enr: req.session.userid},{credit: newcredit})
         //console.log(updcredit)
    }




        else {
            res.render('usHom')
        }   
 })






module.exports = router