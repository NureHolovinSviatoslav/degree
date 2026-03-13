'use strict';

const { LessonProgress } = require('../models/LessonProgress');
const express = require('express');
const { createAuthMiddleware } = require('../services/createAuthMiddleware');
const { roles } = require('../services/roles');
const { onLessonCompleted } = require('../services/gamification');

const router = express.Router();

const getAll = async (req, res) => {
  try {
    const progress = await LessonProgress.findAll();
    res.send(progress);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const progress = await LessonProgress.findByPk(id);
    if (!progress) {
      return res.status(404).send('Lesson progress not found');
    }
    res.send(progress);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const add = async (req, res) => {
  const progressData = { ...req.body };

  try {
    const progress = await LessonProgress.create(progressData);

    if (progress.completed_at) {
      await onLessonCompleted(progress.user_id, progress.lesson_id);
    }

    res.status(201).send(progress);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const progressData = { ...req.body };

  try {
    const existing = await LessonProgress.findByPk(id);

    if (!existing) {
      return res.status(404).send('Lesson progress not found');
    }

    const wasCompleted = !!existing.completed_at;

    await LessonProgress.update(progressData, { where: { id } });
    const progress = await LessonProgress.findByPk(id);

    if (!wasCompleted && progress.completed_at) {
      await onLessonCompleted(progress.user_id, progress.lesson_id);
    }

    res.send(progress);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await LessonProgress.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).send('Lesson progress not found');
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
