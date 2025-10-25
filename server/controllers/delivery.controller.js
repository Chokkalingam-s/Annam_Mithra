const admin = require('../config/firebase.config'); // Firebase Admin initialized
const db = require('../models');
const User = db.User;

exports.requestPartner = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        fcmToken: { [db.Sequelize.Op.ne]: null }
      },
      attributes: ['fcmToken']
    });

    const tokens = users.map(u => u.fcmToken);

    if (tokens.length === 0) {
      return res.json({ success: true, message: 'No users with FCM tokens found.' });
    }

    const notifications = tokens.map(token => ({
      token,
      notification: {
        title: 'Delivery Partner Needed',
        body: 'A delivery partner is needed nearby to deliver food.'
      }
    }));

    // Send notifications sequentially or in batches
    for (const message of notifications) {
      await admin.messaging().send(message);
    }

    res.json({ success: true, message: 'Notifications sent to all users.' });
  } catch (err) {
    console.error('Failed to send notifications:', err);
    res.status(500).json({ success: false, message: 'Failed to send notifications.', error: err.message });
  }
};
