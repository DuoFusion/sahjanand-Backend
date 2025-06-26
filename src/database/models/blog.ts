const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, },
    content: { type: String, },
    slug: { type: String },
    metaTitle: { type: String },
    image: { type: String },
    metaDescription: { type: String },
    metaKeywords: [{ type: String }],
    category: { type: String },
    tags: [{ type: String }],
    scheduledAt: { type: Date },
    status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export const blogModel = mongoose.model('blog', blogSchema);