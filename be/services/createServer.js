'use strict';

const express = require('express');
const cors = require('cors');
const { router: vaccineRouter } = require('../routes/vaccine');
const { router: locationItemRouter } = require('../routes/locationItem');
const { router: locationRouter } = require('../routes/location');
const { router: notificationRouter } = require('../routes/notification');
const { router: sensorDataRouter } = require('../routes/sensorData');
const { router: userRouter } = require('../routes/user');

const createServer = (port) => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use('/vaccines', vaccineRouter);
  app.use('/locations', locationRouter);
  app.use('/locationItems', locationItemRouter);
  app.use('/notifications', notificationRouter);
  app.use('/sensorData', sensorDataRouter);
  app.use('/users', userRouter);

  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
};

module.exports = {
  createServer,
};
