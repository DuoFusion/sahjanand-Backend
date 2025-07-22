import { cartModel } from '../../database';
import { apiResponse } from '../../common';
import { reqInfo, responseMessage } from '../../helper';
let ObjectId = require('mongoose').Types.ObjectId;

// Helper to find product index by productId and color
const findProductIndex = async (products, productId, color) => {
    return products.findIndex(
        p => p.productId.toString() === productId && p.color === color
    );
};

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
            // Create new cart with the product
            cart = await new cartModel({
                userId: new ObjectId(user?._id),
                products: [{ productId, quantity, color, size, price }]
            }).save();
        } else {
            const index = await findProductIndex(cart.products, productId, color);
            if (index > -1) {
                cart.products[index].quantity += quantity;
                if (price !== undefined) cart.products[index].price += price;
                if (size !== undefined) cart.products[index].size = size;
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
    let { user } = req.headers, { productId, color, quantity, size, price } = req.body;
    try {
        let cart = await cartModel.findOne({ userId: new ObjectId(user?._id), isDeleted: false });
        if (!cart) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Cart'), {}, {}));
        const index = await findProductIndex(cart.products, productId, color);
        if (index === -1) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Product in Cart'), {}, {}));
        // Update fields if provided
        if (quantity !== undefined) cart.products[index].quantity = quantity;
        if (size !== undefined) cart.products[index].size = size;
        if (price !== undefined) cart.products[index].price = price;
        await cart.save();
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('Cart'), cart, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const removeCartItem = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers, { productId, color } = req.body;
    try {
        let cart = await cartModel.findOne({ userId: new ObjectId(user?._id), isDeleted: false });
        if (!cart) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Cart'), {}, {}));
        const index = await findProductIndex(cart.products, productId, color);
        if (index > -1) {
            cart.products.splice(index, 1); // Remove the item completely
            await cart.save();
            return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('Cart Item'), cart, {}));
        } else {
            return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('Product in Cart'), {}, {}));
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};