const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from the header
        const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Check if the token payload has the expected structure
        if (!decoded.user || !decoded.user.id) {
            return res.status(401).json({ error: 'Invalid token structure' });
        }

        // Find user by ID
        const user = await User.findById(decoded.user.id).select('-password');

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Set user in request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = auth; 