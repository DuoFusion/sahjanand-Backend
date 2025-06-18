import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { userModel } from '../database';

export const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                status: 401,
                message: 'Authentication required'
            });
        }

        const decoded = jwt.verify(token, config.JWT_TOKEN_SECRET) as any;
        
        // Check if user exists and is active
        const user = await userModel.findOne({ 
            _id: decoded.id,
            isDeleted: false,
            isActive: true
        });

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: 'User not found or inactive'
            });
        }

        // Add user info to request
        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            status: 401,
            message: 'Invalid or expired token'
        });
    }
}; 