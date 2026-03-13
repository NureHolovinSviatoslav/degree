'use strict';

require('dotenv').config();
const { createServer } = require('./services/createServer');
const { sequelize } = require('./services/db');

const PORT = process.env.PORT || 3000;

createServer(PORT);

(async () => {
  await sequelize.sync({ alter: true });
})();
