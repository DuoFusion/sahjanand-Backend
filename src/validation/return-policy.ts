import Joi from "joi";

export const addEditReturnPolicySchema = Joi.object().keys({
    returnPolicy: Joi.string().required()
})