module.exports = (sequelize, Sequelize) => {
  const Chat = sequelize.define("chat", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    senderId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    receiverId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    donationId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    isRead: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  });

  return Chat;
};
