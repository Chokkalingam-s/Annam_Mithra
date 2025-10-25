const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require("./user.model.js")(sequelize, Sequelize);
db.Donation = require("./donation.model.js")(sequelize, Sequelize);
db.Interest = require("./interest.model.js")(sequelize, Sequelize);
db.Chat = require("./chat.model.js")(sequelize, Sequelize);
db.Delivery = require("./delivery.model.js")(sequelize, Sequelize);
db.Badge = require("./badge.model.js")(sequelize, Sequelize);

// Define associations
db.User.hasMany(db.Donation, { foreignKey: 'donorId', as: 'donations' });
db.Donation.belongsTo(db.User, { foreignKey: 'donorId', as: 'donor' });

db.Donation.hasMany(db.Interest, { foreignKey: 'donationId', as: 'interests' });
db.Interest.belongsTo(db.Donation, { foreignKey: 'donationId' });
db.Interest.belongsTo(db.User, { foreignKey: 'receiverId', as: 'receiver' });

db.Donation.hasMany(db.Chat, { foreignKey: 'donationId' });
db.Chat.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });
db.Chat.belongsTo(db.User, { foreignKey: 'receiverId', as: 'receiver' });

db.User.hasMany(db.Badge, { foreignKey: 'userId' });
db.Badge.belongsTo(db.User, { foreignKey: 'userId' });

module.exports = db;

db.Tag = require("./tag.model.js")(sequelize, Sequelize);
db.TagVerification = require("./tagVerification.model.js")(sequelize, Sequelize);

// Relationships
db.Tag.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'creator'
});

db.TagVerification.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'verifier'
});

db.TagVerification.belongsTo(db.Tag, {
  foreignKey: 'tagId',
  as: 'tag'
});

db.Tag.hasMany(db.TagVerification, {
  foreignKey: 'tagId',
  as: 'verifications'
});
