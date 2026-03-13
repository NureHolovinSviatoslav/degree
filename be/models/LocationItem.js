'use strict';

const { Sequelize } = require('sequelize');
const { sequelize } = require('../services/db');
const { Location } = require('./Location');
const { Vaccine } = require('./Vaccine');

const LocationItem = sequelize.define(
  'location_item',
  {
    location_item_id: {
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
    vaccine_id: {
      type: Sequelize.INTEGER,
      references: {
        model: Vaccine,
        key: 'vaccine_id',
      },
    },
    quantity: Sequelize.INTEGER,
  },
  {
    tableName: 'location_item',
    timestamps: false,
  },
);

LocationItem.belongsTo(Location, {
  foreignKey: 'location_id',
  onDelete: 'CASCADE',
});
Location.hasMany(LocationItem, {
  foreignKey: 'location_id',
  onDelete: 'CASCADE',
});

LocationItem.belongsTo(Vaccine, {
  foreignKey: 'vaccine_id',
  onDelete: 'CASCADE',
});
Vaccine.hasMany(LocationItem, {
  foreignKey: 'vaccine_id',
  onDelete: 'CASCADE',
});

module.exports = {
  LocationItem,
};
