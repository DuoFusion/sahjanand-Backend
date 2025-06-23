"use strict"
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Request, Response } from 'express'
import { userModel, userSessionModel } from '../../database'
import { apiResponse } from '../../common'
import { email_verification_mail, reqInfo, responseMessage } from '../../helper'
import { config } from '../../../config'

const ObjectId = require('mongoose').Types.ObjectId
const jwt_token_secret = config.JWT_TOKEN_SECRET

export const signUp = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let body = req.body,
            otp,
            otpFlag = 1, // OTP has already assign or not for cross-verification
            authToken = 0
            let  isAlready : any = await userModel.findOne({ email: body?.email, isActive: true })
        if (isAlready) return res.status(409).json(new apiResponse(409, responseMessage?.alreadyEmail, {}, {}))
         isAlready = await userModel.findOne({ phoneNumber: body?.phoneNumber, isActive: true })
        if (isAlready) return res.status(409).json(new apiResponse(409, "phone number exist already", {}, {}))
        

        if (isAlready?.isBlock == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}))

        const salt = await bcryptjs.genSaltSync(10)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        delete body.password
        body.password = hashPassword
        let response = await new userModel(body).save()
        response = {
            userType: response?.userType,
            isEmailVerified: response?.isEmailVerified,
            _id: response?._id,
            email: response?.email,
        }

        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                otp = await Math.round(Math.random() * 1000000);
                if (otp.toString().length == 6) {
                    flag++;
                }
            }
            let isAlreadyAssign = await userModel.findOne({ otp: otp });
            if (isAlreadyAssign?.otp != otp) otpFlag = 0;
        }

        let result: any = await email_verification_mail(response, otp);
        if (result) {
            await userModel.findOneAndUpdate(body, { otp, otpExpireTime: new Date(new Date().setMinutes(new Date().getMinutes() + 10)) })
            return res.status(200).json(new apiResponse(200, `${result}`, {}, {}));
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.errorMail, {}, `${result}`));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const login = async (req, res) => { 
    let body = req.body,
        response: any
    reqInfo(req)
    try {
        response = await userModel.findOneAndUpdate({ email: body?.email, isActive: true , userType : 0 }, { $addToSet: { deviceToken: body?.deviceToken } , isLoggedIn : true }).select('-__v -createdAt -updatedAt')

        if (!response) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordEmail, {}, {}))
        if (response?.isBlock == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}))

        const passwordMatch = await bcryptjs.compare(body.password, response.password)
        if (!passwordMatch) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordEmail, {}, {}))
        const token = jwt.sign({
            _id: response._id,
            type: response.userType,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)

        await new userSessionModel({
            createdBy: response._id,
        }).save()
        response = {
            isEmailVerified: response?.isEmailVerified,
            userType: response?.userType,
            _id: response?._id,
            email: response?.email,
            token,
        }
        return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response, {}))

    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const reset_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        { email } = body;

    try {

        const salt = await bcryptjs.genSaltSync(10)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        delete body.password
        delete body.id
        body.password = hashPassword

        let response = await userModel.findOneAndUpdate({ email: body?.email, isActive: true, otp: null }, body, { new: true })
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.resetPasswordSuccess, response, {}))
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.resetPasswordError, {}, {}))

    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const adminSignUp = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let body = req.body,
            otp,
            otpFlag = 1; // OTP has already assign or not for cross-verification
        let isAlready = await userModel.findOne({ email: body?.email, isActive: true, userType : 1  })
        if (isAlready) return res.status(409).json(new apiResponse(409, responseMessage?.alreadyEmail, {}, {}))

        if (isAlready?.isBlock == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}))

        const salt = await bcryptjs.genSaltSync(10)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        delete body.password
        body.password = hashPassword
        body.userType = 1  //to specify this user is admin
        let response = await new userModel(body).save()
        response = {
            userType: response?.userType,
            isEmailVerified: response?.isEmailVerified,
            _id: response?._id,
            email: response?.email,
        }

        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                otp = await Math.round(Math.random() * 1000000);
                if (otp.toString().length == 6) {
                    flag++;
                }
            }
            let isAlreadyAssign = await userModel.findOne({ otp: otp });
            if (isAlreadyAssign?.otp != otp) otpFlag = 0;
        }

        let result: any = await email_verification_mail(response, otp);
        if (result) {
            await userModel.findOneAndUpdate(body, { otp, otpExpireTime: new Date(new Date().setMinutes(new Date().getMinutes() + 10)) })
            return res.status(200).json(new apiResponse(200, `${result}`, {}, {}));
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.errorMail, {}, `${result}`));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const adminLogin = async (req: Request, res: Response) => { //email or password // phone or password
    let body = req.body,
        response: any
    reqInfo(req)
    try {
        response = await userModel.findOneAndUpdate({ email: body?.email, userType: 1, isActive: true }, { isLoggedIn : true }).select('-__v -createdAt -updatedAt')

        if (!response) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordEmail, {}, {}))
        if (response?.isBlock == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}))

        const passwordMatch = await bcryptjs.compare(body.password, response.password)
        if (!passwordMatch) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordEmail, {}, {}))
        const token = jwt.sign({
            _id: response._id,
            type: response.userType,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)

        await new userSessionModel({
            createdBy: response._id,
        }).save()
        response = {
            isEmailVerified: response?.isEmailVerified,
            userType: response?.userType,
            _id: response?._id,
            email: response?.email,
            token,
        }
        return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response, {}))

    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}