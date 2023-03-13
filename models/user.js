
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        match:/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
    },
    password:{
        type:String,
        required:true
    },
    isVerified: {
        type: Boolean,
        default: false,
      },
    token: { type: String }
})


module.exports = mongoose.model('user',userSchema)


