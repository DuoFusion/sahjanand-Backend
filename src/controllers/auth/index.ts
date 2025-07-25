"use strict"
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Request, Response } from 'express'
import { userModel, userSessionModel } from '../../database'
import { apiResponse } from '../../common'
import { email_verification_mail, reqInfo, responseMessage } from '../../helper'
import { config } from '../../../config'
import { OAuth2Client } from 'google-auth-library'
const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID)


const ObjectId = require('mongoose').Types.ObjectId
const jwt_token_secret = config.JWT_TOKEN_SECRET

export const signUp = async (req, res) => {
    reqInfo(req)
    try {
        let body = req.body
        let isAlready: any = await userModel.findOne({ email: body?.email, isDeleted: false })
        if (isAlready) return res.status(404).json(new apiResponse(404, responseMessage?.alreadyEmail, {}, {}))
        isAlready = await userModel.findOne({ phoneNumber: body?.phoneNumber, isDeleted: false })
        if (isAlready) return res.status(404).json(new apiResponse(404, "phone number exist already", {}, {}))

        if (isAlready?.isBlocked == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}))

        const salt = await bcryptjs.genSaltSync(10)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        delete body.password
        body.password = hashPassword
        let response = await new userModel(body).save()

        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.errorMail, {}, {}));
        return res.status(200).json(new apiResponse(200, response, {}, {}))
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
        response = await userModel.findOne({ email: body?.email, isDeleted: false }).lean()

        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.invalidUserPasswordEmail, {}, {}))
        if (response?.isBlocked == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}))

        const passwordMatch = await bcryptjs.compare(body.password, response.password)
        if (!passwordMatch) return res.status(404).json(new apiResponse(404, responseMessage?.invalidUserPasswordEmail, {}, {}))
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
            token,
        }
        return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response, {}))

    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const reset_password = async (req, res) => {
    reqInfo(req)
    let body = req.body
    try {

        let isEmailExist = await userModel.findOne({ email: body?.email, isDeleted: false })
        if (!isEmailExist) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("user"), {}, {}))

        if (body?.password !== body?.confirmPassword) {
            return res.status(404).json(new apiResponse(404, "Password and confirm password not match", {}, {}))
        }
        const salt = await bcryptjs.genSaltSync(10)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        delete body.password
        delete body.id
        body.password = hashPassword

        let response = await userModel.findOneAndUpdate({ email: body?.email, isDeleted: false }, body, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.resetPasswordError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.resetPasswordSuccess, response, {}))

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
        let isAlready = await userModel.findOne({ email: body?.email, isActive: true, userType: 1 })
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
        response = await userModel.findOneAndUpdate({ email: body?.email, userType: 1, isActive: true }, { isLoggedIn: true }).select('-__v -createdAt -updatedAt')

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

export const googleSignUp = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        const { idToken, address } = req.body
        if (!idToken) return res.status(400).json(new apiResponse(400, "Google ID token required", {}, {}))

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: config.GOOGLE_CLIENT_ID,
        })
        const payload = ticket.getPayload()
        if (!payload) return res.status(400).json(new apiResponse(400, "Invalid Google token", {}, {}))

        const { email, given_name, family_name, picture, sub: googleId } = payload
        
        let user = await userModel.findOne({ email, isDeleted: false })
        if (!user) {
            user = await new userModel({
                email,
                firstName: given_name,
                lastName: family_name,
                profilePhoto: picture,
                googleId,
                userType: "user",
                address: address || undefined,
            }).save()
        }

        const token = jwt.sign({
            _id: user._id,
            type: user.userType,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)

        const response = {
            isEmailVerified: user.isEmailVerified,
            userType: user.userType,
            _id: user._id,
            token,
        }
        return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}