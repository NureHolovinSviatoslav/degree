'use strict';

const { Course } = require('../models/Course');
const express = require('express');
const { createAuthMiddleware } = require('../services/createAuthMiddleware');
const { roles } = require('../services/roles');

const router = express.Router();

const getAll = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.send(courses);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).send('Course not found');
    }
    res.send(course);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const add = async (req, res) => {
  const courseData = { ...req.body };

  try {
    const course = await Course.create(courseData);
    res.status(201).send(course);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const courseData = { ...req.body };

  try {
    await Course.update(courseData, { where: { id } });
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).send('Course not found');
    }
    res.send(course);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Course.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).send('Course not found');
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
