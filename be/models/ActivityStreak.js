'use strict';

const { Sequelize } = require('sequelize');
const { sequelize } = require('../services/db');
const { User } = require('./User');

const ActivityStreak = sequelize.define(
  'activity_streak',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    current_count: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    last_active_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: 'activity_streaks',
    timestamps: false,
  },
);

ActivityStreak.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
User.hasOne(ActivityStreak, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = {
  ActivityStreak,
};
