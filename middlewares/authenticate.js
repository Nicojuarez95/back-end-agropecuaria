// ARCHIVO: /middlewares/authenticate.js
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const authenticate = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, message: 'No autorizado, token falló' });
        }
    }
    if (!token) {
        res.status(401).json({ success: false, message: 'No autorizado, no hay token' });
    }
};
