import Joi from 'joi';

export const createRoleSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    permissions: Joi.array().items(
        Joi.object({
            module: Joi.string().required(),
            actions: Joi.array().items(
                Joi.string().valid('create', 'read', 'update', 'delete', 'manage')
            ).required()
        })
    ).required()
});

export const updateRoleSchema = Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    permissions: Joi.array().items(
        Joi.object({
            module: Joi.string().required(),
            actions: Joi.array().items(
                Joi.string().valid('create', 'read', 'update', 'delete', 'manage')
            ).required()
        })
    ),
    isActive: Joi.boolean()
}); 