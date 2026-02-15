'use strict';

const { Sequelize } = require('sequelize');
const { sequelize } = require('../services/db');

const User = sequelize.define(
  'user',
  {
    username: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    password_hash: Sequelize.STRING,
    role: Sequelize.STRING,
    phone: Sequelize.STRING,
  },
  {
    tableName: 'user',
    timestamps: false,
  },
);

module.exports = {
  User,
};
