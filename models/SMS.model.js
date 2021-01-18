module.exports = (sequelize, Sequelize) => {
    return sequelize.define("messages", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      message: {
        type: Sequelize.STRING 
      },
      number: {
        type: Sequelize.STRING 
      },
      status: {
        type: Sequelize.STRING 
      },
      createdAt: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
         type: Sequelize.DATEONLY,
      },
      type: {
        type: Sequelize.STRING 
      },
      dateReceived: {
        type: Sequelize.STRING 
      },
      error: {
        type: Sequelize.STRING 
      },
      dateSent: {
        type: Sequelize.STRING 
      },
    }, {
        freezeTableName: true
    });
  
  };