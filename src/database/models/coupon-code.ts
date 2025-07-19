var mongoose = require('mongoose');

const couponCodeSchema = new mongoose.Schema({
    code: { type: String },
    description: { type: String }, // Optional description
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true }, // Type of discount
    discountValue: { type: Number, required: true }, // Value of discount (e.g., 10 for 10% or 100 for ₹100)
    minOrderAmount: { type: Number, default: 0 }, // Minimum order amount to apply coupon
    maxDiscountAmount: { type: Number }, // Maximum discount allowed (for percentage type)
    usageLimit: { type: Number, default: 1 }, // How many times this coupon can be used in total
    usageCount: { type: Number, default: 0 }, // How many times it has been used
    userUsageLimit: { type: Number, default: 1 }, // How many times a single user can use this coupon
    validFrom: { type: Date }, // Start date
    validTo: { type: Date }, // End date
    isActive: { type: Boolean, default: true }, // Is coupon active
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const couponCodeModel = mongoose.model('coupon-code', couponCodeSchema);