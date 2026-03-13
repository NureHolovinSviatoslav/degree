const { jwt } = require('./jwt');

function createSelfMiddleware() {
  if (process.env.MODE_TEST === 'true') {
    return [];
  }

  return [
    jwt,
    (req, res, next) => {
      const user = req.user;
      let id = req.params.id;

      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (id === 'me') {
        id = user.id;
        req.params.id = id;
      }

      if (id !== user.id && user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    },
  ];
}

module.exports = { createSelfMiddleware };
