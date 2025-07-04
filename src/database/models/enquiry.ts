var mongoose = require('mongoose')

const enquirySchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String },
    message: { type: String },
    type: { type: String, enum: ['enquiry', 'contact-us'] },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const enquiryModel = mongoose.model('enquiry', enquirySchema);