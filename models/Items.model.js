module.exports = (sequelize, Sequelize) => {
    return sequelize.define("tblitems", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
       item_no: {
        type: Sequelize.INTEGER,
      },
      sender: {
        type: Sequelize.STRING
      },
      sender_payment: {
        type: Sequelize.STRING
      },
      receiver: {
        type: Sequelize.STRING
      },
      receiver_payment: {
        type: Sequelize.STRING
      },
      tracking_num: {
        type: Sequelize.STRING
      },
      batch_num: {
        type: Sequelize.STRING
      },
      phone_number: {
        type: Sequelize.STRING
      },
      declared_item: {
        type: Sequelize.STRING
      },
      weight: {
        type: Sequelize.STRING
      },
      dimensions: {
        type: Sequelize.STRING
      },
      quantity: {
        type: Sequelize.STRING
      },
      isDelivered: {
        type: Sequelize.STRING,
        defaultValue: '0'
      },
      current_location: {
          type: Sequelize.STRING,
          defaultValue: '0'
      },
      clientTransactionNo: {
          type: Sequelize.STRING,
      },
      trxTimeStamp: {
          type: Sequelize.STRING,
      },
      isSent: {
          type: Sequelize.STRING,
          defaultValue: '0'
      }
    }, {
        freezeTableName: true,
        timestamps: false,
    });
  
  };