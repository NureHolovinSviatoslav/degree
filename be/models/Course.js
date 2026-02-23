'use strict';

const { Sequelize } = require('sequelize');
const { sequelize } = require('../services/db');
const { User } = require('./User');

const Course = sequelize.define(
  'course',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    teacher_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    is_published: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: 'courses',
    timestamps: false,
  },
);

Course.belongsTo(User, {
  foreignKey: 'teacher_id',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
User.hasMany(Course, {
  foreignKey: 'teacher_id',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

module.exports = {
  Course,
};
