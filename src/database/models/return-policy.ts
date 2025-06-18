const mongoose = require('mongoose')

const returnPolicySchema: any = new mongoose.Schema({
    returnPolicy: { type: String },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false })

export const returnPolicyModel = mongoose.model('return-policy', returnPolicySchema);