const config = require("../config/db.config.js");
const Sequelize = require("sequelize");


const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
      host: config.HOST,
      dialect: config.dialect,
      port:3306,
      pool: {
        max: config.pool.max,
        min: config.pool.min,
        acquire: config.pool.acquire,
        idle: config.pool.idle
      }
    }
  );

  sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

  const db = {};
  db.Sequelize = Sequelize;
  db.sequelize = sequelize;

  db.SMS = require("../models/SMS.model")(sequelize, Sequelize);
  db.users = require("../models/Users.model")(sequelize, Sequelize);

  module.exports = db;