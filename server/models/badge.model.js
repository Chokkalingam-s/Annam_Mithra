module.exports = (sequelize, Sequelize) => {
  const Badge = sequelize.define("badge", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    badgeType: {
      type: Sequelize.ENUM('first_donation', 'third_donation', 'fifth_donation', 
                           'tenth_donation', 'first_delivery', 'fifth_delivery', 
                           'tenth_delivery', 'gratitude'),
      allowNull: false
    },
    count: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    }
  });

  return Badge;
};
