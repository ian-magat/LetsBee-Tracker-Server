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
      } ,
      isSelected: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      } 
    }, {
        freezeTableName: true,
        timestamps: false,
    });
  
  };