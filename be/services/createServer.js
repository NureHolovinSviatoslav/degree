'use strict';

const express = require('express');
const cors = require('cors');
const { router: userRouter } = require('../routes/user');
const { router: courseRouter } = require('../routes/course');
const { router: lessonRouter } = require('../routes/lesson');
const { router: testQuestionRouter } = require('../routes/testQuestion');
const { router: answerOptionRouter } = require('../routes/answerOption');
const { router: enrollmentRouter } = require('../routes/enrollment');
const { router: lessonProgressRouter } = require('../routes/lessonProgress');
const { router: badgeRouter } = require('../routes/badge');
const { router: userBadgeRouter } = require('../routes/userBadge');
const { router: activityStreakRouter } = require('../routes/activityStreak');
const {
  router: gamificationSettingsRouter,
} = require('../routes/gamificationSettings');
const { router: notificationRouter } = require('../routes/notification');

const createServer = (port) => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use('/users', userRouter);
  app.use('/courses', courseRouter);
  app.use('/lessons', lessonRouter);
  app.use('/test-questions', testQuestionRouter);
  app.use('/answer-options', answerOptionRouter);
  app.use('/enrollments', enrollmentRouter);
  app.use('/lesson-progress', lessonProgressRouter);
  app.use('/badges', badgeRouter);
  app.use('/user-badges', userBadgeRouter);
  app.use('/activity-streaks', activityStreakRouter);
  app.use('/gamification-settings', gamificationSettingsRouter);
  app.use('/notifications', notificationRouter);

  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
};

module.exports = {
  createServer,
};
