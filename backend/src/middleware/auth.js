const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied. No token.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await db.query('SELECT * FROM users WHERE id = $1 AND is_active = true', [decoded.id]);

    if (!result.rows[0]) return res.status(401).json({ message: 'User not found or deactivated.' });

    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access forbidden. Insufficient role.' });
  }
  next();
};

module.exports = { authenticate, authorize };
