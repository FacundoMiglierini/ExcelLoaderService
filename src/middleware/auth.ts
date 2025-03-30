import { NextFunction, Request, Response } from "express";
import { ValidateSignature } from "../utils/authUtils";


export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isValid = await ValidateSignature(req);
        if (isValid) {
            return next();
        } else {
            return res.status(401).send({ message: 'Not authorized' });
        }
    } catch (err) {
        console.error(err);
        if (err instanceof Error) {
            return res.status(401).send({ message: err.message });
        } else {
            console.error('Unknown error:', err);
            return res.status(500).send({ message: 'Internal Server Error' });
        }
    }
};

