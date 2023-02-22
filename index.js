const express = require('express') //imports express
const app = express() //makes app

const  routes  = require('./routes.js') //imports routes

const hbs = require('hbs') //imports handlebars 
hbs.registerPartials(__dirname + '/views/partials', (err) => {}); // registers partials for handlebars
app.set('view engine', 'hbs'); //sets view engine to handlebars

require('dotenv').config() // ensures .env is used in index.js
const port = process.env.PORT  //stores the port
const DB = process.env.DB //stores the address to database

app.use(express.json())  //sends data in form of json objects
app.use(express.urlencoded({extended:false}))  //body parser

app.use('/',routes) //calls routes

//listens to port
app.listen(port , () =>{
    console.log(port)    
})