import Joi from 'joi';

export const validateBanner = (req, res, next) => {
    const schema = Joi.object({
        type: Joi.string().valid('hero', 'offer', 'collection', 'section').required(),
        title: Joi.string().required(),
        imageDesktop: Joi.string().uri(),
        imageMobile: Joi.string().uri(),
        priority: Joi.number().integer().min(0),
        linkType: Joi.string().valid('product', 'collection', 'page', 'none').default('none'),
        linkId: Joi.string().when('linkType', { is: Joi.string().valid('none'), then: Joi.optional(), otherwise: Joi.string().required() }),
        isActive: Joi.boolean(),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: 400, message: error.details[0].message });
    next();
};

export const validateSortBanners = (req, res, next) => {
    const schema = Joi.object({
        sortedIds: Joi.array().items(Joi.string().required()).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: 400, message: error.details[0].message });
    next();
}; 