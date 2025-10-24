module.exports = (sequelize, Sequelize) => {
  const Donation = sequelize.define("donation", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    donorId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    foodName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    remainingQuantity: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    foodType: {
      type: Sequelize.ENUM('veg', 'non-veg'),
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    images: {
      type: Sequelize.JSON,
      defaultValue: []
    },
    latitude: {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: false
    },
    longitude: {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: false
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    targetReceiverType: {
      type: Sequelize.ENUM('individual', 'ngo', 'both'),
      defaultValue: 'both'
    },
    status: {
      type: Sequelize.ENUM('active', 'partially_accepted', 'completed', 'cancelled'),
      defaultValue: 'active'
    },
    expiresAt: {
      type: Sequelize.DATE,
      allowNull: false
    }
  });

  return Donation;
};
