import { apiResponse } from '../../common';
import { userModel, roleModel } from '../../database';
import { createData, reqInfo, responseMessage } from '../../helper';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../../config';

export const login = async (req, res) => {
    reqInfo(req)
    try {
        const { email, password } = req.body;

        // Find user
        const user = await userModel.findOne({ email, isDeleted: false });
        if (!user) {
            return res.status(400).json(new apiResponse(400, 'Invalid email or password', {}, {}));
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json(new apiResponse(400, 'Invalid email or password', {}, {}));
        }

        // Check if user is admin
        if (!user.isAdmin) {
            return res.status(403).json(new apiResponse(403, 'Access denied. Admin privileges required.', {}, {}));
        }

        // Get user role
        const role = await roleModel.findById(user.role);
        if (!role) {
            return res.status(400).json(new apiResponse(400, 'Role not found', {}, {}));
        }

        // Generate token
        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email,
                role: role.name,
                isSuperAdmin: user.isSuperAdmin
            },
            config.JWT_TOKEN_SECRET,
            { expiresIn: '24h' }
        );

        // Update last login
        await userModel.findByIdAndUpdate(user._id, { 
            lastLogin: new Date(),
            isLoggedIn: true
        });

        return res.status(200).json(new apiResponse(200, 'Login successful', {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: role.name,
                isSuperAdmin: user.isSuperAdmin,
                permissions: role.permissions
            }
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const createManager = async (req, res) => {
    reqInfo(req)
    try {
        const { name, email, password, roleType } = req.body;

        // Check if user exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json(new apiResponse(400, 'Email already registered', {}, {}));
        }

        // Find role based on type
        const role = await roleModel.findOne({ 
            name: roleType === 'product' ? 'Product Manager' : 'Order Manager'
        });
        if (!role) {
            return res.status(400).json(new apiResponse(400, 'Role not found', {}, {}));
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await createData(userModel, {
            name,
            email,
            password: hashedPassword,
            role: role._id,
            isAdmin: true,
            department: roleType === 'product' ? 'Product Management' : 'Order Management',
            designation: roleType === 'product' ? 'Product Manager' : 'Order Manager'
        });

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Manager'), {
            id: user._id,
            name: user.name,
            email: user.email,
            role: role.name
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const logout = async (req, res) => {
    reqInfo(req)
    try {
        const userId = req.user.id;
        await userModel.findByIdAndUpdate(userId, { 
            isLoggedIn: false
        });
        return res.status(200).json(new apiResponse(200, 'Logout successful', {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};
