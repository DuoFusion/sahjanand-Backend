var mongoose = require('mongoose')

const askAQuestionSchema = new mongoose.Schema({
    name: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
    message: { type: String },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const askAQuestionModel = mongoose.model('ask-a-question', askAQuestionSchema);