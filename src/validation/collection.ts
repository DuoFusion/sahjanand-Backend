import Joi from 'joi';

// For creating/updating a collection
export const collectionSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('our', 'occasion', 'material', 'color', 'theme').required(),
  description: Joi.string().allow(''),
  banner: Joi.string().uri().allow(''),
  isVisible: Joi.boolean(),
  products: Joi.array().items(), // MongoDB ObjectId
  priority: Joi.number().integer().min(0)
});

// For assigning products to a collection
export const assignProductsSchema = Joi.object({
  productIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required()
}); 