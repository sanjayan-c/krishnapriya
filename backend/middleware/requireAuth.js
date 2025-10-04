// middleware/requireAuth.js
const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach to req for downstream handlers if needed
    req.user = payload; // { id, username, iat, exp }
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
