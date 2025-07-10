var mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    name: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    lat: { type: String },
    long: { type: String },
    isDefault: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const addressModel = mongoose.model('address', addressSchema);