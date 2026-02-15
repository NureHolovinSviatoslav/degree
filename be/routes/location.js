'use strict';

const { LocationItem } = require('../models/LocationItem');
const { Vaccine } = require('../models/Vaccine');
const { Location } = require('../models/Location');
const { SensorData } = require('../models/SensorData');
const express = require('express');
const { createAuthMiddleware } = require('../services/createAuthMiddleware');
const { roles } = require('../services/roles');

const router = express.Router();

const getAll = async (req, res) => {
  try {
    const locations = await Location.findAll();
    res.send(locations);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const location = await Location.findByPk(parseInt(id));
    if (!location) {
      return res.status(404).send('Location not found');
    }
    res.send(location);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const add = async (req, res) => {
  const locationData = { ...req.body };

  try {
    const location = await Location.create(locationData);
    res.status(201).send(location);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const locationData = { ...req.body };

  try {
    const locationItems = await LocationItem.findAll({
      where: { location_id: parseInt(id) },
    });
    if (
      locationData.max_quantity <
      locationItems.reduce((acc, item) => acc + item.quantity, 0)
    ) {
      return res.status(412).send('Max quantity exceeded');
    }

    await Location.update(locationData, {
      where: { location_id: parseInt(id) },
    });
    const location = await Location.findByPk(
      parseInt(locationData.location_id || id),
    );
    if (!location) {
      return res.status(404).send('Location not found');
    }
    res.send(location);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Location.destroy({
      where: { location_id: parseInt(id) },
    });
    if (!deleted) {
      return res.status(404).send('Location not found');
    }

    await LocationItem.destroy({
      where: { location_id: parseInt(id) },
    });
    await SensorData.destroy({
      where: { location_id: parseInt(id) },
    });

    res.status(204).send({});
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getReport = async (req, res) => {
  const { id } = req.params;

  try {
    const location = await Location.findByPk(parseInt(id));
    if (!location) {
      return res.status(404).send('Location not found');
    }

    const locationItems = await LocationItem.findAll({
      where: { location_id: parseInt(id) },
      include: Vaccine,
    });
    const sensorData = await SensorData.findAll({
      where: { location_id: parseInt(id) },
    });

    res.send({
      location_id: location.location_id,
      name: location.name,
      address: location.address,
      location_items: locationItems,
      sensor_data: sensorData,
      used_quantity: locationItems.reduce(
        (acc, item) => acc + item.quantity,
        0,
      ),
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

router.get('/', ...createAuthMiddleware([roles.STAFF, roles.ADMIN]), getAll);
router.get('/:id', ...createAuthMiddleware([roles.STAFF, roles.ADMIN]), getOne);
router.get(
  '/:id/report',
  ...createAuthMiddleware([roles.STAFF, roles.ADMIN]),
  getReport,
);
router.post('/', ...createAuthMiddleware([roles.ADMIN]), add);
router.patch('/:id', ...createAuthMiddleware([roles.ADMIN]), update);
router.delete('/:id', ...createAuthMiddleware([roles.ADMIN]), remove);

module.exports = { router };
