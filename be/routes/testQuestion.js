'use strict';

const { TestQuestion } = require('../models/TestQuestion');
const express = require('express');
const { createAuthMiddleware } = require('../services/createAuthMiddleware');
const { roles } = require('../services/roles');

const router = express.Router();

const getAll = async (req, res) => {
  try {
    const questions = await TestQuestion.findAll();
    res.send(questions);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const question = await TestQuestion.findByPk(id);
    if (!question) {
      return res.status(404).send('Test question not found');
    }
    res.send(question);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const add = async (req, res) => {
  const questionData = { ...req.body };

  try {
    const question = await TestQuestion.create(questionData);
    res.status(201).send(question);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const questionData = { ...req.body };

  try {
    await TestQuestion.update(questionData, { where: { id } });
    const question = await TestQuestion.findByPk(id);
    if (!question) {
      return res.status(404).send('Test question not found');
    }
    res.send(question);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await TestQuestion.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).send('Test question not found');
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
