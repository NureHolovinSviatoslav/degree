'use strict';

const { User } = require('../models/User');
const {
  GamificationSettings,
} = require('../models/GamificationSettings');
const express = require('express');
const { hashString } = require('../services/hashString');
const jwtLib = require('jsonwebtoken');
const { createAuthMiddleware } = require('../services/createAuthMiddleware');
const { createSelfMiddleware } = require('../services/createSelfMiddleware');
const { roles } = require('../services/roles');

const router = express.Router();

const getAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
    });
    res.send(users);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const add = async (req, res) => {
  const userData = { ...req.body };

  try {
    const user = await User.create({
      ...userData,
      password_hash: hashString(userData.password).toString(),
    });
    res.status(201).send({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const userData = { ...req.body };

  try {
    const updateData = { ...userData };
    if (userData.password) {
      updateData.password_hash = hashString(userData.password).toString();
    }
    delete updateData.password;

    await User.update(updateData, { where: { id } });
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await User.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).send('User not found');
    }
    res.status(204).send({});
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).send('Користувач з такою поштою вже існує');
    }

    const user = await User.create({
      name,
      email,
      password_hash: hashString(password).toString(),
      role: roles.STUDENT,
      phone: phone || null,
    });

    await GamificationSettings.create({
      user_id: user.id,
      badges_enabled: true,
      streaks_enabled: true,
      notifications_enabled: true,
    });

    const accessToken = jwtLib.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    res.status(201).json({ accessToken });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user || user.password_hash !== hashString(password).toString()) {
      return res.status(401).send('Invalid email or password');
    }

    const accessToken = jwtLib.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    res.json({ accessToken });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

router.get('/', ...createAuthMiddleware([roles.ADMIN]), getAll);
router.get('/:id', ...createSelfMiddleware(), getOne);
router.post('/', add);
router.patch('/:id', ...createAuthMiddleware([roles.ADMIN]), update);
router.delete('/:id', ...createAuthMiddleware([roles.ADMIN]), remove);
router.post('/login', login);
router.post('/register', register);

module.exports = { router };
