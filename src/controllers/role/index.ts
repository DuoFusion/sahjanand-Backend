import { apiResponse } from '../../common';
import { roleModel } from '../../database';
import { createData, getData, getDataWithSorting, reqInfo, responseMessage, updateData, deleteData } from '../../helper';
import { createRoleSchema, updateRoleSchema } from '../../validation/role';

export const createRole = async (req, res) => {
    reqInfo(req)
    try {
        const body = req.body;
        
        // Validate request body
        const { error } = createRoleSchema.validate(body);
        if (error) {
            return res.status(400).json(new apiResponse(400, error.message, {}, {}));
        }

        const response = await createData(roleModel, body);
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Role'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getRoles = async (req, res) => {
    reqInfo(req)
    try {
        const { limit = 20, page = 1 } = req.query;
        const criteria = { isDeleted: false };
        const options = {
            skip: (page - 1) * limit,
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        };

        const response = await getDataWithSorting(roleModel, criteria, {}, options);
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Roles'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateRole = async (req, res) => {
    reqInfo(req)
    try {
        const { id } = req.params;
        const body = req.body;

        // Validate request body
        const { error } = updateRoleSchema.validate(body);
        if (error) {
            return res.status(400).json(new apiResponse(400, error.message, {}, {}));
        }

        const response = await updateData(roleModel, { _id: id }, body, {});
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Role'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteRole = async (req, res) => {
    reqInfo(req)
    try {
        const { id } = req.params;
        const response = await deleteData(roleModel, { _id: id });
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Role'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getRoleById = async (req, res) => {
    reqInfo(req)
    try {
        const { id } = req.params;
        const response = await getData(roleModel, { _id: id, isDeleted: false }, {}, {});
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Role'), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
}; 