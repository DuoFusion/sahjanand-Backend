var mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    name: { type: String },
    message: { type: String },
    image: { type: String },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const testimonialModel = mongoose.model('testimonial', TestimonialSchema); 