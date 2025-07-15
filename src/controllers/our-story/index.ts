import { createData, getData, updateData, deleteData, reqInfo, responseMessage, countData } from "../../helper";
import { apiResponse } from "../../common";
import { ourStoryModel } from "../../database";

const ObjectId = require("mongoose").Types.ObjectId;

export const add_edit_our_story = async (req, res) => {
    reqInfo(req)
    const body = req.body;
    try {
        const response = await ourStoryModel.findOneAndUpdate({ isDeleted: false }, body, { new: true, upsert: true })
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("our story"), response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const get_all_stories = async (req, res) => {
    reqInfo(req)
    try {
        const response = await ourStoryModel.findOne({ isDeleted: false })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("our story"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("our story"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}