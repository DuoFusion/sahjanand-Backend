import { couponCodeModel } from '../../database/models/coupon-code';
import { apiResponse } from '../../common';
import { countData, deleteData, getData, reqInfo, responseMessage } from '../../helper';

const ObjectId = require("mongoose").Types.ObjectId;

const isDateInFuture = (date: Date) => !date || new Date(date) > new Date();

export const add_coupon_code = async (req, res) => {
    reqInfo(req);
    try {
        const body = req.body;

        // 1. Required fields
        if (!body.code || !body.discountType || !body.discountValue)
            return res.status(400).json(new apiResponse(400, "Code, discountType, and discountValue are required.", {}, {}));

        // 2. Unique code
        const isExist = await couponCodeModel.findOne({ code: body.code, isDeleted: false });
        if (isExist) return res.status(400).json(new apiResponse(400, responseMessage?.dataAlreadyExist("Coupon Code"), {}, {}));

        // // 3. Discount type check
        // if (!['percentage', 'fixed'].includes(body.discountType))
        //     return res.status(400).json(new apiResponse(400, "Invalid discountType. Must be 'percentage' or 'fixed'.", {}, {}));

        // // 4. Discount value check
        // if (body.discountValue <= 0)
        //     return res.status(400).json(new apiResponse(400, "Discount value must be greater than 0.", {}, {}));

        // // 5. Percentage-specific: maxDiscountAmount required
        // if (body.discountType === 'percentage' && !body.maxDiscountAmount)
        //     return res.status(400).json(new apiResponse(400, "maxDiscountAmount is required for percentage discount.", {}, {}));

        // // 6. Date checks
        // if (body.validFrom && body.validTo && new Date(body.validFrom) > new Date(body.validTo))
        //     return res.status(400).json(new apiResponse(400, "validFrom cannot be after validTo.", {}, {}));
        // if (body.validTo && !isDateInFuture(body.validTo))
        //     return res.status(400).json(new apiResponse(400, "validTo must be a future date.", {}, {}));

        // // 7. Usage limits
        // if (body.usageLimit && body.usageLimit < 1)
        //     return res.status(400).json(new apiResponse(400, "usageLimit must be at least 1.", {}, {}));
        // if (body.userUsageLimit && body.userUsageLimit < 1)
        //     return res.status(400).json(new apiResponse(400, "userUsageLimit must be at least 1.", {}, {}));

        // // 8. Min order amount
        // if (body.minOrderAmount && body.minOrderAmount < 0)
        //     return res.status(400).json(new apiResponse(400, "minOrderAmount cannot be negative.", {}, {}));

        // 9. Create coupon
        const coupon = await new couponCodeModel(body).save();
        return res.status(200).json(new apiResponse(200, "Coupon code added successfully.", coupon, {}));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, {}));
    }
};

export const edit_coupon_code = async (req, res) => {
    reqInfo(req);
    const body = req.body;
    try {

        // 1. Find coupon
        const coupon = await couponCodeModel.findOne({ _id: new ObjectId(body.couponCodeId), isDeleted: false });
        if (!coupon) return res.status(404).json(new apiResponse(404, "Coupon code not found.", {}, {}));

        const isExist = await couponCodeModel.findOne({ code: body.code, isDeleted: false, _id: { $ne: new ObjectId(body.couponCodeId) } });
        if (isExist) return res.status(400).json(new apiResponse(400, "Coupon code already exists.", {}, {}));

        // if (body.discountType && !['percentage', 'fixed'].includes(body.discountType))
        //     return res.status(400).json(new apiResponse(400, "Invalid discountType. Must be 'percentage' or 'fixed'.", {}, {}));

        // // 4. Discount value check
        // if (body.discountValue !== undefined && body.discountValue <= 0)
        //     return res.status(400).json(new apiResponse(400, "Discount value must be greater than 0.", {}, {}));

        // // 5. Percentage-specific: maxDiscountAmount required
        // if ((body.discountType === 'percentage' || coupon.discountType === 'percentage') &&
        //     (body.maxDiscountAmount === undefined && coupon.maxDiscountAmount === undefined))
        //     return res.status(400).json(new apiResponse(400, "maxDiscountAmount is required for percentage discount.", {}, {}));

        // // 6. Date checks
        // if (body.validFrom && body.validTo && new Date(body.validFrom) > new Date(body.validTo))
        //     return res.status(400).json(new apiResponse(400, "validFrom cannot be after validTo.", {}, {}));
        // if (body.validTo && !isDateInFuture(body.validTo))
        //     return res.status(400).json(new apiResponse(400, "validTo must be a future date.", {}, {}));

        // // 7. Usage limits
        // if (body.usageLimit !== undefined && body.usageLimit < 1)
        //     return res.status(400).json(new apiResponse(400, "usageLimit must be at least 1.", {}, {}));
        // if (body.userUsageLimit !== undefined && body.userUsageLimit < 1)
        //     return res.status(400).json(new apiResponse(400, "userUsageLimit must be at least 1.", {}, {}));

        // // 8. Min order amount
        // if (body.minOrderAmount !== undefined && body.minOrderAmount < 0)
        //     return res.status(400).json(new apiResponse(400, "minOrderAmount cannot be negative.", {}, {}));

        // 9. Update coupon
        const updated = await couponCodeModel.findOneAndUpdate({ _id: new ObjectId(body.couponCodeId), isDeleted: false }, body, { new: true });
        return res.status(200).json(new apiResponse(200, "Coupon code updated successfully.", updated, {}));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, {}));
    }
};

export const delete_coupon_code = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await deleteData(couponCodeModel, { _id: new ObjectId(id), isDeleted: false });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Coupon Code'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Coupon Code'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const get_all_coupon_codes = async (req, res) => {
    reqInfo(req);
    let { page, limit, search } = req.query, criteria: any = {}, options: any = { lean: true };
    try {
        criteria.isDeleted = false;

        if (search) {
            criteria.$or = [
                { code: { $regex: search, $options: 'si' } },
            ];
        }

        options.sort = { priority: 1 };

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(couponCodeModel, criteria, {}, options);
        const totalCount = await countData(couponCodeModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Coupon Code'), {
            coupon_code_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const get_coupon_code_by_id = async (req, res) => {
    reqInfo(req)
    const { id } = req.params;
    try {
        const response = await getData(couponCodeModel, { _id: new ObjectId(id), isDeleted: false }, {}, {});
        if (!response || response.length === 0) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Color'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Color'), response[0], {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};