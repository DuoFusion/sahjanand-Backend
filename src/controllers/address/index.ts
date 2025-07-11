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

export const create_address = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers, body = req.body
    try {
        body.userId = user._id

        if (body.isDefault === true) {
            await addressModel.updateMany(
                {
                    userId: new ObjectId(user._id),
                    isDeleted: false
                },
                { isDefault: false }
            )
        }

        const newAddress = new addressModel(body)
        const savedAddress = await newAddress.save()

        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("Address"), { address: savedAddress }, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const update_address = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers, body = req.body
    try {

        const existingAddress = await addressModel.findOne({ _id: new ObjectId(body.addressId), userId: new ObjectId(user._id), isDeleted: false })
        if (!existingAddress) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('Address'), {}, {}))

        if (body.isDefault === true) {
            await addressModel.updateMany({ userId: new ObjectId(user._id), _id: { $ne: new ObjectId(body.addressId) }, isDeleted: false }, { isDefault: false })
        }

        const updatedAddress = await addressModel.findOneAndUpdate({ _id: new ObjectId(body.addressId) }, body, { new: true })

        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("Address"), { address: updatedAddress }, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_address = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers, { id } = req.params
    try {

        const existingAddress = await addressModel.findOne({ _id: new ObjectId(id), userId: new ObjectId(user._id), isDeleted: false })

        if (!existingAddress) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('Address'), {}, {}))

        await addressModel.findOneAndUpdate({ _id: new ObjectId(id) }, { isDeleted: true }, { new: true })

        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("Address"), {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}