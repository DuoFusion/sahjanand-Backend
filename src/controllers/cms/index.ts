import { apiResponse } from '../../common';
import { cmsModel } from '../../database/models/cms';
import { createData, getData, getFirstMatch, reqInfo, responseMessage, updateData } from '../../helper';

export const createCMSContent = async (req, res) => {
    reqInfo(req)
    try {
        const body = req.body;
        const response = await createData(cmsModel, body);
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('CMS Content'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getCMSContent = async (req, res) => {
    reqInfo(req)
    try {
        const { type, slug } = req.query;
        const criteria: any = { isDeleted: false };
        if (type) criteria.type = type;
        if (slug) criteria.slug = slug;

        const response = await getData(cmsModel, criteria, {}, {});
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('CMS Content'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateCMSContent = async (req, res) => {
    reqInfo(req)
    try {
        const { id } = req.params;
        const body = req.body;
        const response = await updateData(cmsModel, { _id: id }, body, {});
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('CMS Content'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getWhatsAppDetails = async (req, res) => {
    reqInfo(req)
    try {
        const response = await getFirstMatch(cmsModel, { type: 'whatsapp', isDeleted: false }, {}, {});
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('WhatsApp Details'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getSocialLinks = async (req, res) => {
    reqInfo(req)
    try {
        const response = await getData(cmsModel, { type: 'social', isDeleted: false }, {}, {});
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Social Links'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getOfferSlider = async (req, res) => {
    reqInfo(req)
    try {
        const response = await getData(cmsModel, { type: 'offer', isDeleted: false }, {}, {});
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Offer Slider'), response, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
}; 