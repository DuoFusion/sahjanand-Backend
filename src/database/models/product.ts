var mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    sku: { type: String, required: true, unique: true },
    images: [{ type: String }],
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    tags: [{ type: String }],
    attributes: {
        color: [{ type: String }],
        size: [{ type: String }],
        material: [{ type: String }],
        fabric: [{ type: String }],
        occasion: [{ type: String }]
    },
    stock: { type: Number, default: 0 },
    isNewArrival: { type: Boolean, default: false },
    isBestSelling: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    showOnHomepage: { type: Boolean, default: false },
    seo: {
        metaTitle: { type: String },
        metaDescription: { type: String },
        keywords: [{ type: String }]
    },
    rating: { type: Number, default: 0 },
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        rating: { type: Number },
        comment: { type: String },
        date: { type: Date}
    }],
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true, versionKey: false });

// Add index for better search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const productModel = mongoose.model('product', productSchema); 