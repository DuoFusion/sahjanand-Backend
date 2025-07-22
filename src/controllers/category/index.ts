import { apiResponse } from '../../common';
import { categoryModel } from '../../database';
import { responseMessage, reqInfo, getFirstMatch, createData, getData, updateData, countData, deleteData, getDataWithSorting } from '../../helper';

const ObjectId = require('mongoose').Types.ObjectId;

export const createCategory = async (req, res) => {
    reqInfo(req)
    try {
        const body = req.body;

        const isExist = await getFirstMatch(categoryModel, { priority: body.priority }, {}, {});
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("priority"), {}, {}))

        const response = await createData(categoryModel, body);
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Category'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateCategory = async (req, res) => {
    reqInfo(req)
    let { id } = req.body, body = req.body;
    try {
        const isExist = await getFirstMatch(categoryModel, { priority: body.priority, _id: { $ne: new ObjectId(body.id) } }, {}, {});
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("priority"), {}, {}))

        const response = await updateData(categoryModel, { _id: id }, body, {});
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Category'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Category'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteCategory = async (req, res) => {
    reqInfo(req)
    let { id } = req.params;
    try {
        const response = await deleteData(categoryModel, { _id: id });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Category'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Category'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getCategories = async (req, res) => {
    reqInfo(req)
    let { level, parent, page, limit, search } = req.query, criteria: any = { isDeleted: false };
    let options: any = { lean: true };

    try {
        if (level) criteria.level = level;
        if (parent) criteria.parent = parent;
        else criteria.parent = null;

        if (search) {
            criteria.name = { $regex: search, $options: 'si' };
        }

        options.sort = { createdAt: -1 };

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(categoryModel, criteria, {}, options);
        const totalCount = await countData(categoryModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Categories'), { category_data: response, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getUserCategory = async (req, res) => {
    reqInfo(req)
    let { page, limit } = req.query, criteria: any = { isDeleted: false };
    let options: any = { lean: true };

    try {

        options.sort = { priority: -1 };

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getDataWithSorting(categoryModel, criteria, {}, options);
        const totalCount = await countData(categoryModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Categories'), { category_data: response, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getFeaturedCategories = async (req, res) => {
    reqInfo(req)
    let criteria = { isDeleted: false }, options: any = {};
    try {
        options.sort = { priority: 1 }
        const response = await getDataWithSorting(categoryModel, criteria, {}, options);
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Featured Categories'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};