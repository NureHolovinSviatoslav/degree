'use strict';

const { Sequelize } = require('sequelize');
const { sequelize } = require('../services/db');

const Vaccine = sequelize.define(
  'vaccine',
  {
    vaccine_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.STRING,
    description: Sequelize.TEXT,
    min_temperature: Sequelize.INTEGER,
    max_temperature: Sequelize.INTEGER,
    min_humidity: Sequelize.INTEGER,
    max_humidity: Sequelize.INTEGER,
  },
  {
    tableName: 'vaccine',
    timestamps: false,
  },
);

module.exports = {
  Vaccine,
};
