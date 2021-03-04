module.exports = (sequelize, Sequelize) => {
    return sequelize.define("tblannouncement", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
       title: {
        type: Sequelize.STRING,
      },
      value: {
        type: Sequelize.STRING
      } 
    }, {
        freezeTableName: true,
        timestamps: false,
    });
  
  };