var mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String },
    description: { type: String },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    sku: { type: String },
    images: [{ type: String }],
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    uniqueCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'unique-category' },
    tags: [{ type: String }],
    attributes: {
        colorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'color' }],
        sizeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'size' }],
        materialIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'material' }],
        fabricIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'fabric' }],
        occasionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'occasion' }]
    },
    stock: { type: Number, default: 0 },
    isNewArrival: { type: Boolean, default: false },
    isBestSelling: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    showOnHomepage: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true, versionKey: false });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const productModel = mongoose.model('product', productSchema); 