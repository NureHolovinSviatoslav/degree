'use strict';

const { Op } = require('sequelize');
const { ActivityStreak } = require('../models/ActivityStreak');
const { Badge } = require('../models/Badge');
const { UserBadge } = require('../models/UserBadge');
const { Enrollment } = require('../models/Enrollment');
const { Lesson } = require('../models/Lesson');
const { LessonProgress } = require('../models/LessonProgress');
const { GamificationSettings } = require('../models/GamificationSettings');
const { formatDateToYYYYMMDD } = require('./formatDate');

const COURSE_COMPLETION_THRESHOLDS = [1, 3, 5, 7, 15, 30, 60, 90];
const ACTIVITY_STREAK_THRESHOLDS = [1, 3, 5, 7, 15, 30, 60, 90, 120, 365];

async function updateActivityStreak(userId) {
  const today = formatDateToYYYYMMDD(new Date());

  let streak = await ActivityStreak.findOne({ where: { user_id: userId } });

  if (!streak) {
    streak = await ActivityStreak.create({
      user_id: userId,
      current_count: 1,
      last_active_date: today,
    });
    await checkAndAwardStreakBadge(userId, streak.current_count);

    return streak;
  }

  if (streak.last_active_date === today) {
    return streak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateToYYYYMMDD(yesterday);

  if (streak.last_active_date === yesterdayStr) {
    streak.current_count += 1;
  } else {
    streak.current_count = 1;
  }

  streak.last_active_date = today;
  await streak.save();

  await checkAndAwardStreakBadge(userId, streak.current_count);

  return streak;
}

async function awardBadge(userId, badgeName) {
  const badge = await Badge.findOne({ where: { name: badgeName } });

  if (!badge) {
    return;
  }

  const existing = await UserBadge.findOne({
    where: { user_id: userId, badge_id: badge.id },
  });

  if (existing) {
    return;
  }

  await UserBadge.create({
    user_id: userId,
    badge_id: badge.id,
  });
}

async function checkAndAwardStreakBadge(userId, streakCount) {
  const settings = await GamificationSettings.findOne({
    where: { user_id: userId },
  });

  if (settings && !settings.badges_enabled) {
    return;
  }

  for (const threshold of ACTIVITY_STREAK_THRESHOLDS) {
    if (streakCount >= threshold) {
      await awardBadge(userId, `activity_streak-${threshold}`);
    }
  }
}

async function checkAndAwardCourseCompletionBadge(userId) {
  const settings = await GamificationSettings.findOne({
    where: { user_id: userId },
  });

  if (settings && !settings.badges_enabled) {
    return;
  }

  const completedCount = await Enrollment.count({
    where: { user_id: userId, status: 'completed' },
  });

  for (const threshold of COURSE_COMPLETION_THRESHOLDS) {
    if (completedCount >= threshold) {
      await awardBadge(userId, `course_completion-${threshold}`);
    }
  }
}

async function checkCourseCompletion(userId, lessonId) {
  const lesson = await Lesson.findByPk(lessonId);

  if (!lesson) {
    return;
  }

  const courseId = lesson.course_id;

  const courseLessons = await Lesson.findAll({
    where: { course_id: courseId },
    attributes: ['id'],
  });
  const lessonIds = courseLessons.map((l) => l.id);
  const totalLessons = lessonIds.length;

  const completedLessons = await LessonProgress.count({
    where: {
      user_id: userId,
      lesson_id: { [Op.in]: lessonIds },
      completed_at: { [Op.not]: null },
    },
  });

  const percent =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  if (completedLessons >= totalLessons) {
    const enrollment = await Enrollment.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (enrollment && enrollment.status !== 'completed') {
      await Enrollment.update(
        {
          status: 'completed',
          completion_percent: 100,
          last_activity_at: new Date(),
        },
        { where: { user_id: userId, course_id: courseId } },
      );
      await checkAndAwardCourseCompletionBadge(userId);
    }
  } else {
    await Enrollment.update(
      { completion_percent: percent, last_activity_at: new Date() },
      { where: { user_id: userId, course_id: courseId } },
    );
  }
}

async function onLessonCompleted(userId, lessonId) {
  await updateActivityStreak(userId);
  await checkCourseCompletion(userId, lessonId);
}

module.exports = {
  onLessonCompleted,
  updateActivityStreak,
  checkAndAwardStreakBadge,
  checkAndAwardCourseCompletionBadge,
};
