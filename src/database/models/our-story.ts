var mongoose = require('mongoose');

const ourStorySchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    image: { type: String },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const ourStoryModel = mongoose.model('our-story', ourStorySchema);