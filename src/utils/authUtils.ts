import { Request } from "express";
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

import { permissions } from "../config/config";

// This function validates the signature (JWT token) from the request's Authorization header.
// It checks if the token exists and verifies its validity using a secret key.
// Throws an error if the token is missing or invalid.
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

// This function generates a new JWT token using a unique UUID.
// The token is signed with the secret key specified in the configuration.
// The generated token can be used for user authentication or authorization.
export const generateToken = () => {
    const uuid = uuidv4();
    return jwt.sign({ uuid }, permissions.APP_SECRET);
};
