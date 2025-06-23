const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    module: { type: String, required: true },
    actions: [{
        type: String,
        enum: ['create', 'read', 'update', 'delete', 'manage']
    }]
});

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: [permissionSchema],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true, versionKey: false });

export const roleModel = mongoose.model('role', roleSchema); 