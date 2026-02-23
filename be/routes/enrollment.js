'use strict';

const { Enrollment } = require('../models/Enrollment');
const express = require('express');
const { createAuthMiddleware } = require('../services/createAuthMiddleware');
const { roles } = require('../services/roles');

const router = express.Router();

const getAll = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll();
    res.send(enrollments);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(404).send('Enrollment not found');
    }
    res.send(enrollment);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const add = async (req, res) => {
  const enrollmentData = { ...req.body };

  try {
    const enrollment = await Enrollment.create(enrollmentData);
    res.status(201).send(enrollment);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const enrollmentData = { ...req.body };

  try {
    await Enrollment.update(enrollmentData, { where: { id } });
    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(404).send('Enrollment not found');
    }
    res.send(enrollment);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Enrollment.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).send('Enrollment not found');
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
  ...createAuthMiddleware([roles.ADMIN, roles.TEACHER]),
  update,
);
router.delete('/:id', ...createAuthMiddleware([roles.ADMIN]), remove);

module.exports = { router };
