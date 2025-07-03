var mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    message: { type: String },
    image: { type: String },
    rating: { type: Number },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const testimonialModel = mongoose.model('testimonial', TestimonialSchema)