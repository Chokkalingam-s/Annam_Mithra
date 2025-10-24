module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firebaseUid: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      unique: true
    },
    phone: {
      type: Sequelize.STRING,
      unique: true
    },
    role: {
      type: Sequelize.ENUM('donor', 'receiver', 'volunteer'),
      allowNull: false,
      defaultValue: 'donor' // Everyone can donate by default
    },
    receiverType: {
      type: Sequelize.ENUM('individual', 'ngo', 'charity', 'ashram', 'bulk'),
      allowNull: true,
      comment: 'Type of receiver organization or individual'
    },
    vegPreference: {
      type: Sequelize.ENUM('veg', 'non-veg', 'both'),
      defaultValue: 'both',
      allowNull: false
    },
    latitude: {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    fcmToken: {
      type: Sequelize.STRING,
      allowNull: true
    },
    profileImage: {
      type: Sequelize.STRING,
      allowNull: true
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    language: {
      type: Sequelize.ENUM('en', 'ta'),
      defaultValue: 'en'
    },
    profileCompleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Whether user has completed initial profile setup'
    }
  });

  return User;
};
