const jwtLib = require('jsonwebtoken');

function jwt(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 'Bearer TOKEN'

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access token is missing or invalid' });
  }

  jwtLib.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token verification failed' });
    }

    req.user = user;
    next();
  });
}

module.exports = { jwt };
