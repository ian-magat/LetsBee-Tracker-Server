module.exports = (sequelize, Sequelize) => {
    return sequelize.define("tblsmsreference", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      status: {
        type: Sequelize.STRING 
      },
      value: {
        type: Sequelize.STRING 
      } 
    }, {
        freezeTableName: true,
        timestamps: false,
    });
  
  };