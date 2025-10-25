const db = require('../models');
const Chat = db.Chat;
const User = db.User;

// Get chat messages
exports.getChatMessages = async (req, res) => {
  try {
    const { donationId, receiverId } = req.params;
    const firebaseUid = req.user.uid;

    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const messages = await Chat.findAll({
      where: {
        donationId: parseInt(donationId),
        [db.Sequelize.Op.or]: [
          { senderId: user.id, receiverId: parseInt(receiverId) },
          { senderId: parseInt(receiverId), receiverId: user.id }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { donationId, receiverId, message } = req.body;
    const firebaseUid = req.user.uid;

    const user = await User.findOne({ where: { firebaseUid } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const chatMessage = await Chat.create({
      donationId: parseInt(donationId),
      senderId: user.id,
      receiverId: parseInt(receiverId),
      message: message
    });

    // Fetch the created message with user details
    const messageWithDetails = await Chat.findByPk(chatMessage.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: messageWithDetails
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};
