import { FAQ_CATEGORIES } from "../../common";

const mongoose = require('mongoose')

const newsletterSchema: any = new mongoose.Schema({
    email: { type: String },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false })

export const newsLetterModel = mongoose.model('newsletter', newsletterSchema);
