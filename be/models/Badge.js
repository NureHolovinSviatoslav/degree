'use strict';

const { Sequelize } = require('sequelize');
const { sequelize } = require('../services/db');

const Badge = sequelize.define(
  'badge',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    condition_type: {
      type: Sequelize.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['course_completion', 'activity_streak']],
      },
    },
  },
  {
    tableName: 'badges',
    timestamps: false,
  },
);

module.exports = {
  Badge,
};
