'use strict';

const { Sequelize } = require('sequelize');
const { sequelize } = require('../services/db');
const { User } = require('./User');
const { Lesson } = require('./Lesson');

const LessonProgress = sequelize.define(
  'lesson_progress',
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
    lesson_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: Lesson,
        key: 'id',
      },
    },
    is_viewed: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    test_score: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    completed_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'lesson_progress',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'lesson_id'],
      },
    ],
  },
);

LessonProgress.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
User.hasMany(LessonProgress, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

LessonProgress.belongsTo(Lesson, {
  foreignKey: 'lesson_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Lesson.hasMany(LessonProgress, {
  foreignKey: 'lesson_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = {
  LessonProgress,
};
