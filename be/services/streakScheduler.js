'use strict';

const { Op } = require('sequelize');
const { ActivityStreak } = require('../models/ActivityStreak');
const { User } = require('../models/User');
const { GamificationSettings } = require('../models/GamificationSettings');
const { formatDateToYYYYMMDD } = require('./formatDate');
const {
  sendSms,
  formatStreakReminderMessage,
  formatStreakWarningMessage,
} = require('./sendSms');

const DAY_MS = 24 * 60 * 60 * 1000;

function getMsUntilHour(targetHour) {
  const now = new Date();
  const target = new Date(now);

  target.setHours(targetHour, 0, 0, 0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return target - now;
}

async function checkStreaksAndNotify() {
  try {
    const today = formatDateToYYYYMMDD(new Date());

    const streaks = await ActivityStreak.findAll({
      where: {
        [Op.or]: [
          { last_active_date: { [Op.ne]: today } },
          { last_active_date: null },
        ],
        current_count: { [Op.gt]: 0 },
      },
      include: [{ model: User }],
    });

    for (const streak of streaks) {
      const user = streak.user;

      if (!user || !user.phone) {
        continue;
      }

      const settings = await GamificationSettings.findOne({
        where: { user_id: user.id },
      });

      if (
        settings &&
        (!settings.streaks_enabled || !settings.notifications_enabled)
      ) {
        continue;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateToYYYYMMDD(yesterday);

      const data = {
        user_id: user.id,
        phone: user.phone,
        username: user.name,
        streak_days: streak.current_count,
      };

      const message =
        streak.last_active_date === yesterdayStr
          ? formatStreakReminderMessage(data)
          : formatStreakWarningMessage(data);

      console.log(message);

      await sendSms(message);
    }
  } catch (error) {
    console.error('Streak notification check failed:', error);
  }
}

async function resetInactiveStreaks() {
  try {
    const endedDay = new Date();
    endedDay.setDate(endedDay.getDate() - 1);
    const endedDayStr = formatDateToYYYYMMDD(endedDay);

    await ActivityStreak.update(
      { current_count: 0 },
      {
        where: {
          [Op.or]: [
            { last_active_date: { [Op.ne]: endedDayStr } },
            { last_active_date: null },
          ],
          current_count: { [Op.gt]: 0 },
        },
      },
    );
  } catch (error) {
    console.error('Streak reset failed:', error);
  }
}

function startStreakScheduler() {
  const msUntil18 = getMsUntilHour(18);

  setTimeout(() => {
    checkStreaksAndNotify();
    setInterval(checkStreaksAndNotify, DAY_MS);
  }, msUntil18);

  const msUntilMidnight = getMsUntilHour(0);

  setTimeout(() => {
    resetInactiveStreaks();
    setInterval(resetInactiveStreaks, DAY_MS);
  }, msUntilMidnight);
}

module.exports = { startStreakScheduler };
