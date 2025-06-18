import { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../common';

export const validateRequest = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json(new apiResponse(400, error.message, {}, {}));
        }
        next();
    };
}; 