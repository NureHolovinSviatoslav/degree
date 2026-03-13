'use strict';

const { Sequelize } = require('sequelize');
const { sequelize } = require('../services/db');
const { User } = require('./User');
const { Course } = require('./Course');

const Enrollment = sequelize.define(
  'enrollment',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    course_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: Course,
        key: 'id',
      },
    },
    status: {
      type: Sequelize.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['in_progress', 'completed']],
      },
    },
    completion_percent: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    last_activity_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'enrollments',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'course_id'],
      },
    ],
  },
);

Enrollment.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
User.hasMany(Enrollment, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Enrollment.belongsTo(Course, {
  foreignKey: 'course_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Course.hasMany(Enrollment, {
  foreignKey: 'course_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = {
  Enrollment,
};
