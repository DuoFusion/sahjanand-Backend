const mongoose = require('mongoose')

const userSchema: any = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    password: { type: String },
    profilePhoto: { type: String },
    
    // Role and permissions
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
    isAdmin: { type: Boolean, default: false },
    isSuperAdmin: { type: Boolean, default: false },
    
    // Authentication
    otp: { type: Number, default: null },
    otpExpireTime: { type: Date, default: null },
    isEmailVerified: { type: Boolean, default: false },
    
    // Status
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    lastLogin: { type: Date },
    
    // Additional fields
    department: { type: String },
    designation: { type: String },
    accessModules: [{ type: String }],

}, { timestamps: true })

export const userModel = mongoose.model('user', userSchema);