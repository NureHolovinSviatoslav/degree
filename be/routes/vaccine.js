'use strict';

const { LocationItem } = require('../models/LocationItem');
const { Vaccine } = require('../models/Vaccine');
const express = require('express');
const { createAuthMiddleware } = require('../services/createAuthMiddleware');
const { roles } = require('../services/roles');

const router = express.Router();

const getAll = async (req, res) => {
  try {
    const vaccines = await Vaccine.findAll();
    res.send(vaccines);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const vaccine = await Vaccine.findByPk(parseInt(id));
    if (!vaccine) {
      return res.status(404).send('Vaccine not found');
    }
    res.send(vaccine);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const add = async (req, res) => {
  const vaccineData = { ...req.body };

  try {
    const vaccine = await Vaccine.create(vaccineData);
    res.status(201).send(vaccine);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const vaccineData = { ...req.body };

  try {
    await Vaccine.update(vaccineData, {
      where: { vaccine_id: parseInt(id) },
    });
    const vaccine = await Vaccine.findByPk(
      parseInt(vaccineData.vaccine_id || id),
    );
    if (!vaccine) {
      return res.status(404).send('Vaccine not found');
    }
    res.send(vaccine);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Vaccine.destroy({
      where: { vaccine_id: parseInt(id) },
    });
    if (!deleted) {
      return res.status(404).send('Vaccine not found');
    }
    await LocationItem.destroy({ where: { vaccine_id: parseInt(id) } });
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
