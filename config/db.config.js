const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    HOST: "tracker-sms-db.chwogi5d3bhn.ap-east-1.rds.amazonaws.com",
    USER: "admin",
    PASSWORD: "adminpassword",
    DB: "DB_letsbee-Tracker",

    // // LOCAL
    // HOST: 'localhost',
    // USER:'root',
    // PASSWORD: '',
    // DB: 'DB_letsbee-Tracker',

    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
};
  