import { FAQ_CATEGORIES } from "../../common";

const mongoose = require('mongoose')

const faqSchema: any = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    priority: { type: Number, default: 0 },
    category: { type: String, enum: Object.values(FAQ_CATEGORIES), default: FAQ_CATEGORIES.GENERAL },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false })

export const faqModel = mongoose.model('faq', faqSchema);
