'use strict';

const express = require('express');
const { createAuthMiddleware } = require('../services/createAuthMiddleware');
const { roles } = require('../services/roles');
const { LocationItem } = require('../models/LocationItem');
const { Location } = require('../models/Location');

const router = express.Router();

const getAll = async (req, res) => {
  try {
    const items = await LocationItem.findAll();
    res.send(items);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await LocationItem.findByPk(parseInt(id));
    if (!item) {
      return res.status(404).send('Location Item not found');
    }
    res.send(item);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const add = async (req, res) => {
  const itemData = { ...req.body };

  try {
    const location = await Location.findByPk(parseInt(itemData.location_id), {
      include: LocationItem,
    });

    if (
      !location ||
      location.max_quantity <
        location.location_items.reduce((acc, item) => acc + item.quantity, 0) +
          itemData.quantity
    ) {
      return res
        .status(412)
        .send('Location not found or max quantity exceeded');
    }

    const item = await LocationItem.create(itemData);
    res.status(201).send(item);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const itemData = { ...req.body };

  try {
    const location = await Location.findByPk(parseInt(itemData.location_id), {
      include: LocationItem,
    });

    if (
      !location ||
      location.max_quantity <
        location.location_items
          .filter((item) => item.location_item_id !== parseInt(id))
          .reduce((acc, item) => acc + item.quantity, 0) +
          itemData.quantity
    ) {
      return res
        .status(412)
        .send('Location not found or max quantity exceeded');
    }

    await LocationItem.update(itemData, {
      where: { location_item_id: parseInt(id) },
    });
    const item = await LocationItem.findByPk(
      parseInt(itemData.location_item_id || id),
    );
    if (!item) {
      return res.status(404).send('Location Item not found');
    }

    res.send(item);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await LocationItem.destroy({
      where: { location_item_id: parseInt(id) },
    });
    if (!deleted) {
      return res.status(404).send('Location Item not found');
    }
    res.status(204).send({});
  } catch (err) {
    res.status(400).send(err.message);
  }
};

router.get('/', ...createAuthMiddleware([roles.STAFF, roles.ADMIN]), getAll);
router.get('/:id', ...createAuthMiddleware([roles.STAFF, roles.ADMIN]), getOne);
router.post('/', ...createAuthMiddleware([roles.STAFF, roles.ADMIN]), add);
router.patch(
  '/:id',
  ...createAuthMiddleware([roles.STAFF, roles.ADMIN]),
  update,
);
router.delete(
  '/:id',
  ...createAuthMiddleware([roles.STAFF, roles.ADMIN]),
  remove,
);

module.exports = { router };
