import jwt, { decode } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.userId;
        req.authenticated = true;

    } catch (err) {
        req.authenticated = false;
        return res.status(401).json({ message: 'Token is not valid' });
    }
    next();
}

export default authMiddleware;