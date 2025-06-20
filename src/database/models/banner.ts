import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
    type: { type: String, enum: ['hero', 'offer', 'collection', 'section'], required: true },
    title: { type: String, required: true },
    imageDesktop: { type: String, required: true },
    imageMobile: { type: String, required: true },
    priority: { type: Number, default: 0 },
    linkType: { type: String, enum: ['product', 'collection', 'page', 'none'], default: 'none' },
    linkId: { type: mongoose.Schema.Types.ObjectId, refPath: 'linkType', required: function() { return this.linkType !== 'none'; } },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const    bannerModel = mongoose.model('banner', bannerSchema); 