const express = require("express");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user.js");
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
const XMLHttpRequest = require("xhr2");
const Http = new XMLHttpRequest();
const Swal = require("sweetalert2");
const session = require("express-session");
require("dotenv").config();
const DB = process.env.DB;

router.use(express.json()); //sends data in form of json objects
router.use(express.urlencoded({ extended: false })); //body parse

router.use(express.static(__dirname));

// Home page route.
router.get("/", async (req, res) => {
  res.render("home");
});

//about page route
router.get("/about", (req, res) => {
  res.render("about");
});

//Verification process starts
router.get("/channeli", passport.authenticate("oauth2"));
router.get(
  "/callback/",
  passport.authenticate("oauth2", {
    failureRedirect: "/usHom",
    session: false,
  }),
  async (req, res, next) => {
    // Successful authentication, redirect to onboarding. set session
    const data = JSON.parse(Http.responseText);
    const UserData = {
      enr: data.student.enrolmentNumber,
      name: data.person.fullName,
      email: data.contactInformation.emailAddress,
    };
    const user = await User.findOne({ enr: UserData.enr });
    if (user) {
      req.session.userid = user.enr;
      enrol = UserData.enr;
      res.redirect("/users/onboarding/?enrol=" + enrol);
    } else {
      req.session.userid = UserData.enr;
      User.insertMany([UserData]);
      enrol = UserData.enr;
      res.redirect("/users/onboarding/?enrol=" + enrol);
      next();
    }
  }
);
passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: "https://channeli.in/oauth/authorise",
      tokenURL: "https://channeli.in/open_auth/token/",
      clientID: process.env.ID,
      clientSecret: process.env.SECRET,
      callbackURL: "http://localhost:4000/callback",
    },
    (accessToken, refreshToken, profile, cb) => {
      const url = `https://channeli.in/open_auth/get_user_data/`;
      Http.open("GET", url);
      Http.setRequestHeader("Authorization", `Bearer ${accessToken}`);
      Http.send();
      Http.onreadystatechange = function () {
        if (Http.readyState === XMLHttpRequest.DONE && Http.status === 200) {
          const data = JSON.parse(Http.responseText);
          const UserData = {
            enr: data.student.enrolmentNumber,
            name: data.person.fullName,
            email: data.contactInformation.emailAddress,
          };
          return cb(null, Http.responseText);
        }
      };
    }
  )
);
//verification process ends

module.exports = router;
