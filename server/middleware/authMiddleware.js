const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Access Denied. Authorization header missing.' });
    }

    const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"
    if (!token) {
        return res.status(401).json({ message: 'Access Denied. Token missing.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.id) { // Validate required fields
            return res.status(400).json({ message: 'Invalid token payload.' });
        }
        req.user = decoded; // Attach user info to request
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;