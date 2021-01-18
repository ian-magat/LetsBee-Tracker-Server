const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    // HOST: "letsbeeriders.c4rxjr6wovbq.us-east-2.rds.amazonaws.com",
    // USER: "admin",
    // PASSWORD: "adminpassword",
    // DB: "letsbeeRiderDB",

    // // LOCAL
    HOST: 'localhost',
    USER:'root',
    PASSWORD: '',
    DB: 'DB_letsbee-Tracker',

    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
};
  