const authMiddleware = require('./authMiddleware');

const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    console.log('Decoded user:', req.user); // Debugging: Check the user object
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Not authorized.' });
    }
    next();
  });
};

module.exports = adminMiddleware;