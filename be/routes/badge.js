'use strict';

const { Badge } = require('../models/Badge');
const express = require('express');
const { createAuthMiddleware } = require('../services/createAuthMiddleware');
const { roles } = require('../services/roles');

const router = express.Router();

const getAll = async (req, res) => {
  try {
    const badges = await Badge.findAll();
    res.send(badges);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const badge = await Badge.findByPk(id);
    if (!badge) {
      return res.status(404).send('Badge not found');
    }
    res.send(badge);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const add = async (req, res) => {
  const badgeData = { ...req.body };

  try {
    const badge = await Badge.create(badgeData);
    res.status(201).send(badge);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const badgeData = { ...req.body };

  try {
    await Badge.update(badgeData, { where: { id } });
    const badge = await Badge.findByPk(id);
    if (!badge) {
      return res.status(404).send('Badge not found');
    }
    res.send(badge);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Badge.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).send('Badge not found');
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
