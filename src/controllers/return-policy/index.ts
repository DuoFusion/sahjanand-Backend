import { reqInfo, responseMessage } from "../../helper";
import { addEditReturnPolicySchema } from "../../validation";
import { apiResponse } from "../../common";
import { returnPolicyModel } from "../../database";

export const add_edit_return_policy = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers

    try {
        const { error, value } = addEditReturnPolicySchema.validate(req.body)

        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const response = await returnPolicyModel.findOneAndUpdate({ isDeleted: false }, value, { new: true, upsert: true })
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("return policy"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_return_policy = async (req, res) => {
    reqInfo(req)
    try {
        const response = await returnPolicyModel.findOne({ isDeleted: false })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("return policy"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("return policy"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}