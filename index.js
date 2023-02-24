const express = require('express') //imports express
const app = express() //makes app
const cors = require('cors')
const { Vendor , User, Items, Ver } = require('./models/models.js');
const XMLHttpRequest = require("xhr2");
const Http = new XMLHttpRequest();
const passport = require("passport");
const OAuth2Strategy = require('passport-oauth2')

const  routes  = require('./routes.js') //imports routes
const hbs = require('hbs') //imports handlebars 
hbs.registerPartials(__dirname + '/views/partials', (err) => {}); // registers partials for handlebars
app.set('view engine', 'hbs'); //sets view engine to handlebars

require('dotenv').config() // ensures .env is used in index.js
const port = process.env.PORT  //stores the port
const DB = process.env.DB //stores the address to database

app.use(express.json())  //sends data in form of json objects
app.use(express.urlencoded({extended:false}))  //body parser

app.use(cors())

app.use('/',routes) //calls routes

app.get("/channeli", passport.authenticate("oauth2"));

app.get("/channeli/callback" ,  passport.authenticate('oauth2', 
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
            const reqenrollment_number = data.student.enrolmentNumber;
            const UserData = { enr: data.student.enrolmentNumber , name : data.person.fullName}
            Ver.insertMany([UserData])
          }
        }
      }
    )
)



//listens to port
app.listen(port , () =>{
    console.log(port)    
})