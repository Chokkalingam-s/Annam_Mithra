module.exports = (sequelize, Sequelize) => {
  const Tag = sequelize.define("tag", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'User who created the tag'
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
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Description of the location/need'
    },
    estimatedPeople: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Estimated number of people in need'
    },
    images: {
      type: Sequelize.JSON,
      defaultValue: [],
      comment: 'Array of image paths'
    },
    tagType: {
      type: Sequelize.ENUM('homeless_shelter', 'street_location', 'community_center', 'other'),
      defaultValue: 'other'
    },
    status: {
      type: Sequelize.ENUM('active', 'verified', 'inactive'),
      defaultValue: 'active'
    },
    verificationCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Number of users who verified this location'
    }
  });

  return Tag;
};