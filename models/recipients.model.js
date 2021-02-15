module.exports = (sequelize, Sequelize) => {
    return sequelize.define("tblRecipients", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
       mobileNo: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING
      },
      isSend: {
        type: Sequelize.INTEGER,
        defaultValue: '1'
      }
    }, {
        freezeTableName: true,
        timestamps: false,
    });
  
  };