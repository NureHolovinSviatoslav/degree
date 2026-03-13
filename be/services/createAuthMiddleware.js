const { jwt } = require('./jwt');

function createAuthMiddleware(roles) {
  if (process.env.MODE_TEST === 'true') {
    return [];
  }

  return [
    jwt,
    (req, res, next) => {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (!user.role || !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    },
  ];
}

module.exports = { createAuthMiddleware };
