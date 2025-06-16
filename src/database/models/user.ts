const mongoose = require('mongoose')

const userSchema: any = new mongoose.Schema({
    name : {type  : String},
    email: { type: String, required: true },
    phoneNumber: { type: String},
    password: { type: String },
    profilePhoto : {type : String},
   
    otp: { type: Number, default: null },
    otpExpireTime: { type: Date, default: null },
    isEmailVerified: { type: Boolean, default: false },
   
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    isLoggedIn : { type : Boolean , defailt : false},

}, { timestamps: true })

export const userModel = mongoose.model('user', userSchema);