module.exports = (sequelize, Sequelize) => {
  const TagVerification = sequelize.define("tagVerification", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tagId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  });

  return TagVerification;
};