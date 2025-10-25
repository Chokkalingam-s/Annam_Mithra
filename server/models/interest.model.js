module.exports = (sequelize, Sequelize) => {
  const Interest = sequelize.define("interest", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    donationId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'donations',
        key: 'id'
      }
    },
    receiverId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    quantityRequested: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM('pending', 'accepted', 'declined', 'completed'),
      defaultValue: 'pending'
    }
  }, {
    timestamps: true
  });

  return Interest;
};
