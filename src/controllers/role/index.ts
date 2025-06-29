import { Request, Response } from "express";
import { apiResponse } from "../../common";
import { roleModel } from "../../database/models/role";
import { reqInfo, responseMessage } from "../../helper";

const ObjectId = require("mongoose").Types.ObjectId

export const checkRoleExist = async (req, res, next) => {
    const isExist = await roleModel.findOne({ _id: ObjectId(req.body._id || req.params.id) }).lean();
    if (!isExist) return res.status(405).json(new apiResponse(405, responseMessage.getDataNotFound("role"), {}, {}));
    req.roleData = isExist;
    next();
}

export const checkRoleFieldValue = async (field, value, _id?) => {
    const filter: any = { [field]: value };
    if (_id) {
        filter._id = { $ne: new ObjectId(_id) };
    }
    return await roleModel.findOne(filter).lean();
}

export const add_role = async (req, res) => {
    reqInfo(req);
    let body = req.body, { user } = req.headers;
    try {
        const isNameExist = await checkRoleFieldValue("name", body.name);
        if (isNameExist) return res.status(405).json(new apiResponse(405, responseMessage.dataAlreadyExist("role name"), {}, {}));

        body.createdBy = new ObjectId(user?._id)
        body.updatedBy = new ObjectId(user?._id)

        const response = await new roleModel(body).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))

        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("role"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const edit_role_by_id = async (req, res) => {
    reqInfo(req);
    let { _id, name } = req.body;
    try {
        const isNameExist = await checkRoleFieldValue("name", name, _id);
        if (isNameExist) return res.status(405).json(new apiResponse(405, responseMessage.dataAlreadyExist("role name"), {}, {}));

        const response = await roleModel.findOneAndUpdate({ _id: ObjectId(_id) }, req.body, { new: true });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("role"), {}, {}));

        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("role"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_role_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const response = await roleModel.findOneAndUpdate({ _id: ObjectId(req.params.id) }, { isActive: false }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("role"), {}, {}))

        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("role"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const get_all_role = async (req: Request, res: Response) => {
    reqInfo(req);
    let match: any = {}, { page, limit, search, activeFilter } = req.body;
    try {
        if (search) {
            var name: Array<any> = []
            search = search.split(" ")
            search.forEach(data => {
                name.push({ name: { $regex: data, $options: 'si' } })
            })
            match.$or = [{ $and: name }]
        }

        if ('activeFilter' in req.body) match.isActive = activeFilter;

        let response = await roleModel.aggregate([
            { $match: match },
            {
                $facet: {
                    data: [
                        { $sort: { createdAt: - 1 } },
                        { $skip: (((page as number - 1) * limit as number)) },
                        { $limit: limit as number }
                    ],
                    data_count: [{ $count: "count" }]
                }
            }
        ])

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('role'), {
            role_data: response[0].data,
            totalData: response[0].data_count,
            state: {
                page: page as number,
                limit: limit as number,
                page_limit: Math.ceil(response[0].data_count[0]?.count / (req.body.limit) as number) || 1
            }
        }, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_by_id_role = async (req, res: Response) => {
    reqInfo(req);
    try {
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("role"), req.roleData, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}