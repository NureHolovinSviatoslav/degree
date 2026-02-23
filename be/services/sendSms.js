const { Notification } = require('../models/Notification');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const clientTwilio = require('twilio')(accountSid, authToken);

const formatStreakReminderMessage = (data) => {
  return {
    user_id: data.user_id,
    phone: data.phone,
    message: `Hey ${data.username}! Your ${data.streak_days}-day streak is on the line! Complete a lesson before midnight to keep it alive.`,
  };
};

const formatStreakWarningMessage = (data) => {
  return {
    user_id: data.user_id,
    phone: data.phone,
    message: `Don't let your progress slip, ${data.username}! You haven't opened the app today — finish at least one lesson to protect your ${data.streak_days}-day streak.`,
  };
};

const sendSms = async (data, notification_type) => {
  try {
    await clientTwilio.messages.create({
      body: data.message,
      to: `whatsapp:${process.env.DEFAULT_PHONE || data.phone}`,
      from: 'whatsapp:+14155238886',
    });

    await Notification.create({
      user_id: data.user_id,
      channel: 'whatsapp',
      message: data.message,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { sendSms, formatStreakReminderMessage, formatStreakWarningMessage };
