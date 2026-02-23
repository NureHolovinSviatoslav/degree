'use strict';

const { Lesson } = require('../models/Lesson');
const express = require('express');
const { createAuthMiddleware } = require('../services/createAuthMiddleware');
const { roles } = require('../services/roles');

const router = express.Router();

const getAll = async (req, res) => {
  try {
    const lessons = await Lesson.findAll();
    res.send(lessons);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).send('Lesson not found');
    }
    res.send(lesson);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const add = async (req, res) => {
  const lessonData = { ...req.body };

  try {
    const lesson = await Lesson.create(lessonData);
    res.status(201).send(lesson);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const lessonData = { ...req.body };

  try {
    await Lesson.update(lessonData, { where: { id } });
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).send('Lesson not found');
    }
    res.send(lesson);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Lesson.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).send('Lesson not found');
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
