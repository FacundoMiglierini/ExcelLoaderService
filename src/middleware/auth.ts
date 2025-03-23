import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

import { permissions } from "../config/config";


export const ValidateSignature = async (req: Request) => {
    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, permissions.APP_SECRET);
        return true;
    } catch (err) {
        throw new Error('Invalid token');
    }
};

export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isValid = await ValidateSignature(req);
        if (isValid) {
            return next();
        } else {
            return res.status(401).send({ message: "User Not authorised" });
        }
    } catch (err) {
        if (err instanceof Error) {
            return res.status(401).send({ message: err.message });
        } else {
            console.error('Unknown error:', err);
            return res.status(500).send({ message: 'Internal Server Error' });
        }
    }
};

export const generateToken = () => {
    const uuid = uuidv4();
    return jwt.sign({ uuid }, permissions.APP_SECRET);
};
