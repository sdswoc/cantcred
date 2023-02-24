const mongoose = require('mongoose') //imports mongoose

const vendorDetailsSchema = new mongoose.Schema({
    username :{type: String, default : ""}, // we will give username
    password : {type: String, default : ""} , //we will give password
    name : {type: String, default : ""} , 
    email : {type: String, default : ""},
    mob : {type: String, default : ""},
    flag : {type : Boolean , default : false },
   // item : {type : String }
})

const Vendor =  mongoose.model('vendor', vendorDetailsSchema)

const userVerifySchema = new mongoose.Schema({
    name :{type : String},
    enr : {type : String, unique: true , index: true},
})

const userDetailsSchema = new mongoose.Schema({
    name :{type : String},
    enr : {type : String},
    email : {type : String,default:""},
    mob : {type : String, default:""},
    password : {type: String, default:""}
})


const itemSchema = new mongoose.Schema({
    vendorname: {type: String , default:""},
    itemname: String,
    itemprice : Number,
    avail : Boolean
})

const User =  mongoose.model('user', userDetailsSchema)
const Ver = mongoose.model('ver',userVerifySchema)
const Items = mongoose.model('items',itemSchema)

module.exports = { 
    Vendor, Ver , Items ,User
}