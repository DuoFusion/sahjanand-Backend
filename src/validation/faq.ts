import Joi from "joi";

export const addEditFaqSchema = Joi.object().keys({
    question: Joi.string().required(),
    answer: Joi.string().required(),
    category: Joi.string().optional().default('general'),
    priority: Joi.number().required(),
    isActive: Joi.boolean().optional().default(true)
})

export const updateFaqStatusSchema = Joi.object().keys({
    faqId: Joi.string().required(),
    question: Joi.string().optional(),
    answer: Joi.string().optional(),
    category: Joi.string().optional().default('general'),
    priority: Joi.number().optional(),
    isActive: Joi.boolean().optional().default(true)
})

export const getFaqByCategorySchema = Joi.object().keys({
    category: Joi.string().required()
})
