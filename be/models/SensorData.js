'use strict';

const { Sequelize } = require('sequelize');
const { sequelize } = require('../services/db');
const { Location } = require('./Location');

const SensorData = sequelize.define(
  'sensor_data',
  {
    sensor_data_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    location_id: {
      type: Sequelize.INTEGER,
      references: {
        model: Location,
        key: 'location_id',
      },
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    temperature: Sequelize.FLOAT,
    humidity: Sequelize.FLOAT,
  },
  {
    tableName: 'sensor_data',
    timestamps: false,
  },
);

SensorData.belongsTo(Location, {
  foreignKey: 'location_id',
  onDelete: 'CASCADE',
});
Location.hasMany(SensorData, {
  foreignKey: 'location_id',
  onDelete: 'CASCADE',
});

module.exports = {
  SensorData,
};
