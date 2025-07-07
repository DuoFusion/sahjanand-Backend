import { ADMIN_ROLES, apiResponse } from '../../common';
import { userModel, roleModel, collectionModel } from '../../database';
import { countData, getData, reqInfo, responseMessage } from '../../helper';
import bcrypt from 'bcryptjs';

const ObjectId = require("mongoose").Types.ObjectId

export const add_user = async (req, res) => {
    reqInfo(req)
    try {
        let body = req.body
        let role = await roleModel.findOne({ name: ADMIN_ROLES.USER, isDeleted: false })

        let isExist = await userModel.findOne({ email: body?.email, roleId: new ObjectId(role?._id), isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("email"), {}, {}))

        isExist = await userModel.findOne({ phoneNumber: body?.phoneNumber, roleId: new ObjectId(role?._id), isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("phoneNumber"), {}, {}))

        body.userType = ADMIN_ROLES.USER
        let password = await bcrypt.hash(body?.password, 10)
        body.password = password
        body.roleId = new ObjectId(role?._id)

        let response = await new userModel(body).save()
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("user"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}

export const edit_user_by_id = async (req, res) => {
    reqInfo(req)
    try {
        let body = req.body

        let role = await roleModel.findOne({ name: ADMIN_ROLES.USER, isDeleted: false });

        let isExist = await userModel.findOne({ email: body?.email, roleId: new ObjectId(role?._id), isDeleted: false, _id: { $ne: new ObjectId(body?.userId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("email"), {}, {}))

        isExist = await userModel.findOne({ phoneNumber: body?.phoneNumber, roleId: new ObjectId(role?._id), isDeleted: false, _id: { $ne: new ObjectId(body?.userId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("phoneNumber"), {}, {}))

        if (body?.password) {
            let password = await bcrypt.hash(body?.password, 10)
            body.password = password
        }
        body.roleId = new ObjectId(role?._id)

        let response = await userModel.findOneAndUpdate({ _id: new ObjectId(body?.userId) }, body, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("user"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}

export const get_all_users = async (req, res) => {
    reqInfo(req)
    let { page, limit, search } = req.query, criteria: any = {}, options: any = { lean: true }, { user } = req.headers
    try {

        if (user?.roleId?.name === ADMIN_ROLES.USER) {
            criteria._id = new ObjectId(user?._id)
        }

        if (search) {
            criteria.$or = [
                { firstName: { $regex: search, $options: 'si' } },
                { lastName: { $regex: search, $options: 'si' } },
                { email: { $regex: search, $options: 'si' } },
                { phoneNumber: { $regex: search, $options: 'si' } }
            ];
        }

        options.sort = { createdAt: -1 };
        criteria.isDeleted = false

        let role = await roleModel.findOne({ name: ADMIN_ROLES.USER, isDeleted: false }).lean()
        criteria.roleId = new ObjectId(role?._id)

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(userModel, criteria, {}, options);
        const totalCount = await countData(userModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('User'), {
            user_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}

export const get_user_by_id = async (req, res) => {
    reqInfo(req)
    let { id } = req.params
    try {
        let response = await userModel.findOne({ _id: new ObjectId(id), isDeleted: false }).lean()
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("User"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("User"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}

export const add_to_wishlist = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { productId } = req.body;
        let role = await roleModel.findOne({ name: ADMIN_ROLES.USER, isDeleted: false })

        const isExist = await userModel.findOne({ _id: new ObjectId(user?._id), roleId: new ObjectId(role?._id), isDeleted: false });
        if (!isExist) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("User"), {}, {}));

        if (isExist.wishlists && isExist.wishlists.includes(new ObjectId(productId))) return res.status(400).json(new apiResponse(400, "Product already exists in wishlist", {}, {}));

        const response = await userModel.findOneAndUpdate({ _id: new ObjectId(user?._id) }, { $push: { wishlists: new ObjectId(productId) } }, { new: true, lean: true });

        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("User"), {}, {}));
        return res.status(200).json(new apiResponse(200, "Product added to wishlist successfully", response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}

export const remove_from_wishlist = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers, { productId } = req.body
    try {

        let role = await roleModel.findOne({ name: ADMIN_ROLES.USER, isDeleted: false })

        const isExist = await userModel.findOne({ _id: new ObjectId(user?._id), roleId: new ObjectId(role?._id), isDeleted: false });
        if (!isExist) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("User"), {}, {}));

        if (!isExist.wishlists || !isExist.wishlists.includes(new ObjectId(productId))) return res.status(400).json(new apiResponse(400, "Product not found in wishlist", {}, {}));

        const response = await userModel.findOneAndUpdate({ _id: new ObjectId(user?._id) }, { $pull: { wishlists: new ObjectId(productId) } }, { new: true, lean: true });

        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("User"), {}, {}));
        return res.status(200).json(new apiResponse(200, "Product removed from wishlist successfully", response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}

export const get_user_wishlist = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        let role = await roleModel.findOne({ name: ADMIN_ROLES.USER, isDeleted: false })
        const response = await userModel.findOne({ _id: new ObjectId(user?._id), roleId: new ObjectId(role?._id), isDeleted: false })
            .populate({
                path: 'wishlists',
                match: { isDeleted: false },
                select: 'name description price images slug categoryId'
            }).lean();

        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("User"), {}, {}));

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("Wishlist"), {
            wishlist: response.wishlists || [],
            totalItems: response.wishlists ? response.wishlists.length : 0
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}

export const edit_admin_by_id = async (req, res) => {
    reqInfo(req)
    try {
        let body = req.body

        let role = await roleModel.findOne({ name: ADMIN_ROLES.ADMIN, isDeleted: false });

        let isExist = await userModel.findOne({ email: body?.email, roleId: new ObjectId(role?._id), isDeleted: false, _id: { $ne: new ObjectId(body?.userId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("email"), {}, {}))

        isExist = await userModel.findOne({ phoneNumber: body?.phoneNumber, roleId: new ObjectId(role?._id), isDeleted: false, _id: { $ne: new ObjectId(body?.userId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("phoneNumber"), {}, {}))

        if (body?.password) {
            let password = await bcrypt.hash(body?.password, 10)
            body.password = password
        }
        body.roleId = new ObjectId(role?._id)

        let response = await userModel.findOneAndUpdate({ _id: new ObjectId(body?.userId) }, body, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("user"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}

export const get_admin_data = async (req, res) => {
    reqInfo(req)
    try {
        let role = await roleModel.findOne({ name: ADMIN_ROLES.ADMIN, isDeleted: false })
        let response = await userModel.findOne({ roleId: new ObjectId(role?._id), isDeleted: false }).select('email phoneNumber address city state zipCode country gender socialMedia headerOffer').lean()
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("User"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("User"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}