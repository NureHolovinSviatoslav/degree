'use strict';

const { ActivityStreak } = require('../models/ActivityStreak');
const express = require('express');
const { createAuthMiddleware } = require('../services/createAuthMiddleware');
const { roles } = require('../services/roles');

const router = express.Router();

const getAll = async (req, res) => {
  try {
    const streaks = await ActivityStreak.findAll();
    res.send(streaks);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const streak = await ActivityStreak.findByPk(id);
    if (!streak) {
      return res.status(404).send('Activity streak not found');
    }
    res.send(streak);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const add = async (req, res) => {
  const streakData = { ...req.body };

  try {
    const streak = await ActivityStreak.create(streakData);
    res.status(201).send(streak);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const streakData = { ...req.body };

  try {
    await ActivityStreak.update(streakData, { where: { id } });
    const streak = await ActivityStreak.findByPk(id);
    if (!streak) {
      return res.status(404).send('Activity streak not found');
    }
    res.send(streak);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await ActivityStreak.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).send('Activity streak not found');
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
router.patch('/:id', ...createAuthMiddleware([roles.ADMIN]), update);
router.delete('/:id', ...createAuthMiddleware([roles.ADMIN]), remove);

module.exports = { router };
