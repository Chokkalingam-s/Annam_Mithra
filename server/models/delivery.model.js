module.exports = (sequelize, Sequelize) => {
  const Delivery = sequelize.define("delivery", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    donationId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    volunteerId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    requesterId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    pickupLatitude: {
      type: Sequelize.DECIMAL(10, 8)
    },
    pickupLongitude: {
      type: Sequelize.DECIMAL(11, 8)
    },
    dropLatitude: {
      type: Sequelize.DECIMAL(10, 8)
    },
    dropLongitude: {
      type: Sequelize.DECIMAL(11, 8)
    },
    status: {
      type: Sequelize.ENUM('requested', 'accepted', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'requested'
    },
    completedAt: {
      type: Sequelize.DATE
    }
  });

  return Delivery;
};
