module.exports = (sequelize, Sequelize) => {
    return sequelize.define("tbl_user", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: Sequelize.STRING 
      },
      lastName: {
        type: Sequelize.STRING 
      },
      username: {
        type: Sequelize.STRING 
      },
      password: {
        type: Sequelize.STRING 
      },
      datecreated: {
        type: Sequelize.DATEONLY,
      }
      ,
      isAdmin: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    }, {
        freezeTableName: true,
        timestamps: false,
    });
  
  };