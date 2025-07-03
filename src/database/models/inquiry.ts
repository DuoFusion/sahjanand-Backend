var mongoose = require('mongoose')

const inquirySchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String },
    message: { type: String },
    type: { type: String, enum: ['enquiry', 'contact'] },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const inquiryModel = mongoose.model('inquiry', inquirySchema);