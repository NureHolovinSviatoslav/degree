const { Notification } = require('../models/Notification');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const clientTwilio = require('twilio')(accountSid, authToken);

const formatAlertMessage = (data) => {
  return {
    notified_username: data.username,
    phone: data.phone,
    message: `*ALERT!*
    Location: ${data.location_name}
    Address: ${data.location_address}
    Vaccine: ${data.vaccine_name}
    ---
    Errors: ${data.error.low_temperature ? 'Low temperature | ' : ''}${
      data.error.high_temperature ? 'High temperature | ' : ''
    }${data.error.low_humidity ? 'Low humidity | ' : ''}${
      data.error.high_humidity ? 'High humidity | ' : ''
    }`.slice(0, -3),
  };
};

const formatWarningMessage = (data) => {
  return {
    notified_username: data.username,
    phone: data.phone,
    message: `*WARNING!*
    Location: ${data.location_name}
    Address: ${data.location_address}
    ---
    Potential problem detected: ${
      data.error.falling_temperature ? 'Temperature is decreasing | ' : ''
    }${data.error.rising_temperature ? 'Temperature is rising | ' : ''}${
      data.error.falling_humidity ? 'Humidity is falling | ' : ''
    }${data.error.rising_humidity ? 'Humidity is rising | ' : ''}`.slice(0, -3),
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
      notified_username: data.notified_username,
      phone: data.phone,
      message: data.message,
      notification_type,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { sendSms, formatAlertMessage, formatWarningMessage };
