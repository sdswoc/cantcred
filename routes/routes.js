const express = require('express');
const cookieParser = require('cookie-parser')
const sessions = require('express-session')
const router = express.Router();
const { Vendor , Ver, Items, User } = require('../models/models.js');
const mongoose = require('mongoose')
const passport = require("passport");
const OAuth2Strategy = require('passport-oauth2')
const XMLHttpRequest = require("xhr2");
const Http = new XMLHttpRequest();
const Swal = require('sweetalert2');
const { session } = require('passport');
require('dotenv').config()
const DB = process.env.DB



router.use(express.json())  //sends data in form of json objects
router.use(express.urlencoded({extended:false}))  //body parse

router.use(express.static(__dirname))




// Home page route.
router.get('/', (req, res) => {
  res.render('home');
});



//about page route
router.get('/about', (req, res) => {
    res.render('about')
  });
 



  //Verification process starts
router.get("/channeli", passport.authenticate("oauth2"));
router.get("/channeli/callback" ,  passport.authenticate('oauth2', 
{ failureRedirect: '/' }
));
passport.use(
    new OAuth2Strategy(
      {
        authorizationURL: "https://channeli.in/oauth/authorise",
        tokenURL: "https://channeli.in/open_auth/token/",
        clientID: process.env.ID,
        clientSecret: process.env.SECRET,
        callbackURL: "http://localhost:4000/channeli/callback",
      },
       (accessToken, refreshToken, profile, cb) =>{
        const url = `https://channeli.in/open_auth/get_user_data/`;
        Http.open("GET", url);
        Http.setRequestHeader("Authorization", `Bearer ${accessToken}`);
        Http.send();
        Http.onreadystatechange = function () {
          if (Http.readyState === XMLHttpRequest.DONE && Http.status === 200) {
            const data = JSON.parse(Http.responseText);
            console.log(data);
            const UserData = { enr: data.student.enrolmentNumber , name : data.person.fullName}
            Ver.insertMany([UserData])
            }
          }
        }
    )
)
//verification process ends 



module.exports = router;