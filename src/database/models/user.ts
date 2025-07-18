const mongoose = require('mongoose')

const userSchema: any = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
    gender: { type: String },
    mapLink: { type: String },
    profilePhoto: { type: String },
    password: { type: String },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
    userType: { type: String, default: 'user' },
    socialMedia: {
        facebook: { type: String },
        twitter: { type: String },
        instagram: { type: String },
        linkedin: { type: String },
    },
    newsLetterImage: { type: String },
    whatsappNumber: { type: String },
    whatsappMessage: { type: String },
    razorpayKeyId: { type: String },
    razorpayKeySecret: { type: String },
    headerOffer: [{ type: String }],
    wishlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }],
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    lastLogin: { type: Date },
}, { timestamps: true, versionKey: false })

export const userModel = mongoose.model('user', userSchema);