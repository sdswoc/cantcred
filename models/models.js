const mongoose = require('mongoose') //imports mongoose

const vendorDetailsSchema = new mongoose.Schema({
    username :{type: String, default : ""}, // we will give username
    password : {type: String, default : ""} , //we will give password
    name : {type: String, default : ""} ,  
    email : {type: String, default : ""},
    mob : {type: String, default : ""},
    isVerified : {type : Boolean , default : false },
    orders : [
        {
            isPaid : {type: Boolean, default :false},
            isActive : {type: Boolean, default:true},
            itemname :{type :String, default : ""},
            itemprice :{type :Number, default:0},
            quantity : {type: Number, default :0},
            username : {type :String , default:""},
            userenr : {type : Number , default: 0}
        }
    ]
})

const userDetailsSchema = new mongoose.Schema({
    name :{type : String},
    enr : {type : String , unique: true},
    email : {type : String,unique: true , default:""},
    mob : {type : Number, unique:true,  default:0},
    credit :{type: Number, default :200},
    orders : [
            {
                isPaid : {type: Boolean, default :false},
                isActive : {type: Boolean, default:true},
                itemname :{type :String, default : ""},
                itemprice :{type :Number, default:0},
                quantity : {type: Number, default :0},
                totalprice :{type :Number, default:0},
                vendorname : {type :String , default:""},
                username : {type :String , default:""},
                userenr: {type :String , default:""}
            }
    ],
    isVerified :{ type : Boolean , default : false}
})


const itemSchema = new mongoose.Schema({
    vendorname: {type: String , default:""},
    itemname: {type: String, required: true},
    itemprice : Number,
    avail : {type : Boolean, default : true}
})

const User =  mongoose.model('user', userDetailsSchema)
const Items = mongoose.model('items',itemSchema)
const Vendor =  mongoose.model('vendor', vendorDetailsSchema)


module.exports = { 
    Vendor , Items ,User
}