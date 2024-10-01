import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../../config/config";

const authenticationToken = (req: Request, res: Response, next: NextFunction) => {
    console.log("Entered AUTHENTICATIONTOKEN", req.headers['authorization']);

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('Token not found');
        return res.status(401).json({ success: false, message: 'Access denied, token not found' });
    }

    console.log('Token found, verifying...');
    jwt.verify(token, config.jwt_key as string, (err, decoded) => {
        const decodedToken = jwt.decode(token);
        console.log('Decoded Token:', decodedToken);

        if (err) {
            console.log('Invalid token', err);
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }

        console.log('Token is valid:', decoded);

        // Assuming the token contains userId and email
        if (decoded && typeof decoded !== 'string') {
            const { userId, email } = decoded as { userId: string; email: string };

            console.log('Token verified. User ID:', userId, 'Email:', email);

            // You can attach the userId or email to the request object for further use in the next middleware or route
            req.body.userId = userId;
            req.body.email = email;

            next(); // Move to the next middleware
        }
    });
};

export default authenticationToken;
