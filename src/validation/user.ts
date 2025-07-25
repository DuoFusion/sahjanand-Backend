import Joi from 'joi';

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const createManagerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    roleType: Joi.string().valid('product', 'order').required()
});

// Wishlist validation schemas
export const addToWishlistSchema = Joi.object({
    userId: Joi.string().required(),
    productId: Joi.string().required()
});

export const removeFromWishlistSchema = Joi.object({
    userId: Joi.string().required(),
    productId: Joi.string().required()
}); 