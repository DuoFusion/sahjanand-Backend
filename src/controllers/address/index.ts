import { reqInfo } from "../../helper";
import { apiResponse } from "../../common";
import { responseMessage } from "../../helper";
import { addressModel } from "../../database";
import { getData } from "../../helper/database_service";

const ObjectId = require('mongoose').Types.ObjectId;

export const get_address = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers, criteria: any = {}, options: any = {}
    try {
        criteria.userId = new ObjectId(user._id)
        criteria.isDeleted = false
        options.sort = { isDefault: -1, createdAt: -1 } // isDefault true first, then newest
        const response = await getData(addressModel, criteria, {}, options)
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("address"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}