module.exports = (sequelize, Sequelize) => {
    return sequelize.define("tblCurrencies", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
       peso: {
        type: Sequelize.INTEGER,
      },
      won: {
        type: Sequelize.INTEGER
      }
    }, {
        freezeTableName: true,
        timestamps: false,
    });
  
  };