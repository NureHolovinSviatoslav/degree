'use strict';

const { AnswerOption } = require('../models/AnswerOption');
const express = require('express');
const { createAuthMiddleware } = require('../services/createAuthMiddleware');
const { roles } = require('../services/roles');

const router = express.Router();

const getAll = async (req, res) => {
  try {
    const options = await AnswerOption.findAll();
    res.send(options);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const option = await AnswerOption.findByPk(id);
    if (!option) {
      return res.status(404).send('Answer option not found');
    }
    res.send(option);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const add = async (req, res) => {
  const optionData = { ...req.body };

  try {
    const option = await AnswerOption.create(optionData);
    res.status(201).send(option);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const optionData = { ...req.body };

  try {
    await AnswerOption.update(optionData, { where: { id } });
    const option = await AnswerOption.findByPk(id);
    if (!option) {
      return res.status(404).send('Answer option not found');
    }
    res.send(option);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await AnswerOption.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).send('Answer option not found');
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
router.post('/', ...createAuthMiddleware([roles.ADMIN, roles.TEACHER]), add);
router.patch(
  '/:id',
  ...createAuthMiddleware([roles.ADMIN, roles.TEACHER]),
  update,
);
router.delete(
  '/:id',
  ...createAuthMiddleware([roles.ADMIN, roles.TEACHER]),
  remove,
);

module.exports = { router };
