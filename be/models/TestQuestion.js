'use strict';

const { Sequelize } = require('sequelize');
const { sequelize } = require('../services/db');
const { Lesson } = require('./Lesson');

const TestQuestion = sequelize.define(
  'test_question',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    lesson_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: Lesson,
        key: 'id',
      },
    },
    question_text: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'test_questions',
    timestamps: false,
  },
);

TestQuestion.belongsTo(Lesson, {
  foreignKey: 'lesson_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Lesson.hasMany(TestQuestion, {
  foreignKey: 'lesson_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = {
  TestQuestion,
};
