'use strict';

const { Sequelize } = require('sequelize');
const { sequelize } = require('../services/db');

const User = sequelize.define(
  'user',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    role: {
      type: Sequelize.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['admin', 'teacher', 'student']],
      },
    },
    phone: {
      type: Sequelize.STRING(30),
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: 'users',
    timestamps: false,
  },
);

module.exports = {
  User,
};
