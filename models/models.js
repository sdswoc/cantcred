const mongoose = require('mongoose') //imports mongoose

const vendorDetailsSchema = new mongoose.Schema({
    username :{type: String, default : ""}, // we will give username
    password : {type: String, default : ""} , //we will give password
    name : {type: String, default : ""} ,  
    email : {type: String, default : ""},
    mob : {type: String, default : ""},
    flag : {type : Boolean , default : false },
})

const userVerifySchema = new mongoose.Schema({
    name :{type : String},
    enr : {type : String, unique: true , index: true}, 
})

const userDetailsSchema = new mongoose.Schema({
    name :{type : String},
    enr : {type : String},
    email : {type : String,default:""},
    mob : {type : String, default:""},
    password : {type: String, default:""},
    credit :{type: Number, default :200}
})


const itemSchema = new mongoose.Schema({
    vendorname: {type: String , default:""},
    itemname: {type: String, required: true},
    itemprice : Number,
    avail : {type : Boolean, default : true}
})

const User =  mongoose.model('user', userDetailsSchema)
const Ver = mongoose.model('ver',userVerifySchema)
const Items = mongoose.model('items',itemSchema)
const Vendor =  mongoose.model('vendor', vendorDetailsSchema)


module.exports = { 
    Vendor, Ver , Items ,User
}