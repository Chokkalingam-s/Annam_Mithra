module.exports = (sequelize, Sequelize) => {
  const Interest = sequelize.define("interest", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    donationId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    receiverId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    message: {
      type: Sequelize.TEXT
    },
    quantityRequested: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('pending', 'accepted', 'rejected', 'completed'),
      defaultValue: 'pending'
    }
  });

  return Interest;
};
