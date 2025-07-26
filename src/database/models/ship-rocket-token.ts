var mongoose = require('mongoose')

const shipRocketTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    refreshToken: { type: String },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    lastUsed: { type: Date, default: Date.now },
    createdBy: { type: String, default: 'system' }
}, { timestamps: true, versionKey: false });

// Index for token lookup
shipRocketTokenSchema.index({ isActive: 1, expiresAt: 1 });

export const shipRocketTokenModel = mongoose.model('ship_rocket_token', shipRocketTokenSchema); 