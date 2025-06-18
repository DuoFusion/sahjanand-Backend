import { apiResponse } from '../../common';
import { categoryModel } from '../../database';
import { responseMessage, reqInfo, getFirstMatch, createData, getData, updateData } from '../../helper';

export const createCategory = async (req, res) => {
    reqInfo(req)
    try {
        const body = req.body;
        if (body.parent) {
            const parent = await getFirstMatch(categoryModel, { _id: body.parent }, {}, {});
            if (parent) body.level = parent.level + 1;
        }
        const response = await createData(categoryModel, body);
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Category'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getCategories = async (req, res) => {
    reqInfo(req)
    let { level, parent } = req.query, criteria: any = { isDeleted: false };
    try {
         
        if (level) criteria.level = level;
        if (parent) criteria.parent = parent;
        else criteria.parent = null;

        const response = await getData(categoryModel, criteria, {}, {});
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Categories'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getFeaturedCategories = async (req, res) => {
    reqInfo(req)
    try {
        const criteria = { isDeleted: false, isFeatured: true };
        const response = await getData(categoryModel, criteria, {}, {});
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Featured Categories'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateCategory = async (req, res) => {
    reqInfo(req)
    try {
        const { id } = req.params;
        const body = req.body;
        const response = await updateData(categoryModel, { _id: id }, body, {});
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Category'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
}; 