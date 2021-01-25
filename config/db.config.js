const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    HOST: "database-tracker.c4rxjr6wovbq.us-east-2.rds.amazonaws.com",
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
  