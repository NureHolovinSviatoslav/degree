'use strict';

const { UserBadge } = require('../models/UserBadge');
const express = require('express');
const { createAuthMiddleware } = require('../services/createAuthMiddleware');
const { roles } = require('../services/roles');

const router = express.Router();

const getAll = async (req, res) => {
  try {
    const userBadges = await UserBadge.findAll();
    res.send(userBadges);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const userBadge = await UserBadge.findByPk(id);
    if (!userBadge) {
      return res.status(404).send('User badge not found');
    }
    res.send(userBadge);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const add = async (req, res) => {
  const userBadgeData = { ...req.body };

  try {
    const userBadge = await UserBadge.create(userBadgeData);
    res.status(201).send(userBadge);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const userBadgeData = { ...req.body };

  try {
    await UserBadge.update(userBadgeData, { where: { id } });
    const userBadge = await UserBadge.findByPk(id);
    if (!userBadge) {
      return res.status(404).send('User badge not found');
    }
    res.send(userBadge);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await UserBadge.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).send('User badge not found');
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
router.post('/', ...createAuthMiddleware([roles.ADMIN]), add);
router.patch('/:id', ...createAuthMiddleware([roles.ADMIN]), update);
router.delete('/:id', ...createAuthMiddleware([roles.ADMIN]), remove);

module.exports = { router };
