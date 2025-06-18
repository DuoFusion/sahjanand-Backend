const mongoose = require('mongoose')

const termsConditionSchema: any = new mongoose.Schema({
    termsCondition: { type: String },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false })

export const termsConditionModel = mongoose.model('terms-condition', termsConditionSchema);