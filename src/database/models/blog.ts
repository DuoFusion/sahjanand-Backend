const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: [{ type: String }],
    category: { type: String },
    tags: [{ type: String }],
    scheduledAt: { type: Date },
    status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export const blogModel = mongoose.model('blog', blogSchema); 