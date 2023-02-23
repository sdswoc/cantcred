const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
const express = require("express");
const router = express.Router();
const XMLHttpRequest = require("xhr2");
const Http = new XMLHttpRequest();
require('dotenv').config()

router.get("/channeli", passport.authenticate("oauth2"));

router.get("/channeli/callback" ,  passport.authenticate('oauth2', { failureRedirect: '/' }),
function(req, res) {
  // Successful authentication, redirect home.
  console.log("success")
  res.redirect('/users/dashboard');
});

passport.use(
    new OAuth2Strategy(
      {
        authorizationURL: "https://channeli.in/oauth/authorise",
        tokenURL: "https://channeli.in/open_auth/token/",
        clientID: process.env.ID,
        clientSecret: process.env.SECRET,
        callbackURL: "http://localhost:4000/users/dashboard",
      },
       (accessToken, refreshToken, profile, cb) =>{
        console.log("kuch nahi roha ")

        console.log(accessToken)
        console.log("oauth attempted");
        const url = `https://channeli.in/open_auth/get_user_data/`;
        Http.open("GET", url);
        Http.setRequestHeader("Authorization", `Bearer ${accessToken}`);
        Http.send();
        Http.onreadystatechange = function () {
          if (Http.readyState === XMLHttpRequest.DONE && Http.status === 200) {
            console.log(Http.responseText);
            const data = JSON.parse(Http.responseText);
            console.log(data);
            const reqenrollment_number = data.student.enrolmentNumber;
            console.log(reqenrollment_number);}*/
          
  
      }}))


module.exports = router, passport;