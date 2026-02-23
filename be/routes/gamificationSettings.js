'use strict';

const { GamificationSettings } = require('../models/GamificationSettings');
const express = require('express');
const { createAuthMiddleware } = require('../services/createAuthMiddleware');
const { roles } = require('../services/roles');

const router = express.Router();

const getAll = async (req, res) => {
  try {
    const settings = await GamificationSettings.findAll();
    res.send(settings);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const setting = await GamificationSettings.findByPk(id);
    if (!setting) {
      return res.status(404).send('Gamification settings not found');
    }
    res.send(setting);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const add = async (req, res) => {
  const settingsData = { ...req.body };

  try {
    const setting = await GamificationSettings.create(settingsData);
    res.status(201).send(setting);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const settingsData = { ...req.body };

  try {
    await GamificationSettings.update(settingsData, { where: { id } });
    const setting = await GamificationSettings.findByPk(id);
    if (!setting) {
      return res.status(404).send('Gamification settings not found');
    }
    res.send(setting);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await GamificationSettings.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).send('Gamification settings not found');
    }
    res.status(204).send({});
  } catch (err) {
    res.status(400).send(err.message);
  }
};

router.get(
  '/',
  ...createAuthMiddleware([roles.ADMIN, roles.TEACHER, roles.STUDENT]),
  getAll,
);
router.get(
  '/:id',
  ...createAuthMiddleware([roles.ADMIN, roles.TEACHER, roles.STUDENT]),
  getOne,
);
router.post(
  '/',
  ...createAuthMiddleware([roles.ADMIN, roles.STUDENT]),
  add,
);
router.patch(
  '/:id',
  ...createAuthMiddleware([roles.ADMIN, roles.STUDENT]),
  update,
);
router.delete('/:id', ...createAuthMiddleware([roles.ADMIN]), remove);

module.exports = { router };
