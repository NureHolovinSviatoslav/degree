'use strict';

const { SensorData } = require('../models/SensorData');
const express = require('express');
const { createAuthMiddleware } = require('../services/createAuthMiddleware');
const { roles } = require('../services/roles');
const { checkSensorData } = require('../services/checkSensorData');
const {
  sendSms,
  formatAlertMessage,
  formatWarningMessage,
} = require('../services/sendSms');

const router = express.Router();

const getAll = async (req, res) => {
  try {
    const data = await SensorData.findAll();
    res.send(data);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const sensorData = await SensorData.findByPk(parseInt(id));
    if (!sensorData) {
      return res.status(404).send('Sensor Data not found');
    }
    res.send(sensorData);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const add = async (req, res) => {
  const data = { ...req.body };

  try {
    const sensorData = await SensorData.create(data);

    if (process.env.AVOID_VALIDATION !== 'true') {
      const error = await checkSensorData(sensorData.sensor_data_id);
      if (error) {
        const formatted =
          error.level === 'alert'
            ? formatAlertMessage(error)
            : formatWarningMessage(error);
        await sendSms(formatted, error.level);
      }
    }

    res.status(201).send(sensorData);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

router.get('/', ...createAuthMiddleware([roles.STAFF, roles.ADMIN]), getAll);
router.get('/:id', ...createAuthMiddleware([roles.STAFF, roles.ADMIN]), getOne);
router.post('/', ...createAuthMiddleware([roles.IOT, roles.ADMIN]), add);

module.exports = { router };
