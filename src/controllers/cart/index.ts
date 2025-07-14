import { cartModel } from '../../database';
import { apiResponse } from '../../common';
import { reqInfo, responseMessage } from '../../helper';
let ObjectId = require('mongoose').Types.ObjectId;

export const getCart = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers;
    try {
        const cart = await cartModel.findOne({ userId: new ObjectId(user?._id), isDeleted: false }).populate('products.productId');
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Cart'), cart || { products: [] }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const addToCart = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers, { productId, quantity, color, size, price } = req.body;
    try {

        let cart = await cartModel.findOne({ userId: new ObjectId(user?._id), isDeleted: false });
        if (!cart) {
            cart = await new cartModel({ userId: new ObjectId(user?._id), products: [{ productId, quantity, color, size, price }] }).save();
        } else {
            const index = cart.products.findIndex(p => p.productId.toString() === productId);
            if (index > -1) {
                cart.products[index].quantity += quantity;
            } else {
                cart.products.push({ productId, quantity, color, size, price });
            }
            await cart.save();
        }
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Cart'), cart, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const updateCartItem = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers, { productId, quantity } = req.body;
    try {
        let cart = await cartModel.findOne({ userId: new ObjectId(user?._id), isDeleted: false });
        if (!cart) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Cart'), {}, {}));
        const index = cart.products.findIndex(p => p.productId.toString() === productId);
        if (index === -1) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Product in Cart'), {}, {}));
        cart.products[index].quantity = quantity;
        await cart.save();
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Cart'), cart, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const removeCartItem = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers, { productId, quantity, color, size, price } = req.body;
    try {
        let cart = await cartModel.findOne({ userId: new ObjectId(user?._id), isDeleted: false });
        if (!cart) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Cart'), {}, {}));
        const index = cart.products.findIndex(p => p.productId.toString() === productId);
        if (index > -1) {
            cart.products[index].quantity -= 1;
            if (color !== undefined) cart.products[index].color = color;
            if (size !== undefined) cart.products[index].size = size;
            if (price !== undefined) cart.products[index].price = price;
            if (cart.products[index].quantity === 0) {
                cart.products.splice(index, 1);
            }
        } else {
            cart.products.push({ productId, quantity, color, size, price });
        }
        await cart.save();
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Cart Item'), cart, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
}