const jwt = require('jsonwebtoken');
const config = require('config');


module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if there isn't a token
  if (!token) {
    return res.status(401).json({ message: 'No token, autherization denied' });
  }

  //verify token
  try {
    const decodedToken = jwt.verify(token, config.get('jwtSecret'));

    req.user = decodedToken.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
