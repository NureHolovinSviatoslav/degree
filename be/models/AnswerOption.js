'use strict';

const { Sequelize } = require('sequelize');
const { sequelize } = require('../services/db');
const { TestQuestion } = require('./TestQuestion');

const AnswerOption = sequelize.define(
  'answer_option',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    question_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: TestQuestion,
        key: 'id',
      },
    },
    option_text: {
      type: Sequelize.STRING(500),
      allowNull: false,
    },
    is_correct: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'answer_options',
    timestamps: false,
  },
);

AnswerOption.belongsTo(TestQuestion, {
  foreignKey: 'question_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
TestQuestion.hasMany(AnswerOption, {
  foreignKey: 'question_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = {
  AnswerOption,
};
