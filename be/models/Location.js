'use strict';

const { Sequelize } = require('sequelize');
const { sequelize } = require('../services/db');
const { User } = require('./User');

const Location = sequelize.define(
  'location',
  {
    location_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.STRING,
    address: Sequelize.STRING,
    responsible_username: {
      type: Sequelize.STRING,
      allowNull: true,
      references: {
        model: User,
        key: 'username',
      },
    },
    max_quantity: Sequelize.INTEGER,
  },
  {
    tableName: 'location',
    timestamps: false,
  },
);

Location.belongsTo(User, {
  foreignKey: 'responsible_username',
  onDelete: 'SET NULL',
});
User.hasMany(Location, {
  foreignKey: 'responsible_username',
  onDelete: 'SET NULL',
});

module.exports = {
  Location,
};
