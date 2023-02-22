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

const userDetailSchema = new mongoose.Schema({
    name : String,
    enr : String ,
})

const Vendor =  mongoose.model('vendor', vendorDetailsSchema)
const User = mongoose.model('user',userDetailSchema)

module.exports = { 
    Vendor, User
}