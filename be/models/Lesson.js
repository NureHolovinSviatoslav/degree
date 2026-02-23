'use strict';

const { Sequelize } = require('sequelize');
const { sequelize } = require('../services/db');
const { Course } = require('./Course');

const Lesson = sequelize.define(
  'lesson',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    course_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: Course,
        key: 'id',
      },
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    video_url: {
      type: Sequelize.STRING(1000),
      allowNull: false,
    },
    transcription: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    position: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
  },
  {
    tableName: 'lessons',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['course_id', 'position'],
      },
    ],
  },
);

Lesson.belongsTo(Course, {
  foreignKey: 'course_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Course.hasMany(Lesson, {
  foreignKey: 'course_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

module.exports = {
  Lesson,
};
