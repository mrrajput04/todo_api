const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    otp:{
        type:Number,
    }
},{timestamps:true},);


module.exports = mongoose.model('opt',otpSchema,"otps");