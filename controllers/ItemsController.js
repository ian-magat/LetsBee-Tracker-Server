const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
app.use(cors());
const db = require("../models");
const multerConfig = require("../config/multer");
const path = require('path')
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const moment = require('moment');
const csv = require("fast-csv");
const fs = require("fs");

const sendSMS = (req, res) => {

  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      let date_ob = new Date();

      let message = req.body.message;
      let number = req.body.number;
      let status = 'queue';
      let type = req.body.type;

      let date = ("0" + date_ob.getDate()).slice(-2);
      // current month
      let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

      // current year
      let year = date_ob.getFullYear();

      // current hours
      let hours = date_ob.getHours();

      // current minutes
      let minutes = date_ob.getMinutes();



      let curdate = year + "-" + month + "-" + date + " " + hours + ":" + minutes;
      db.SMS.create({
        message: message,
        number: number,
        status: status,
        type: type,
        dateSent: curdate
      })
        .then(() => {
          let ref = refresh();
          ref.then((data) =>
            global.io.emit('reload', data)
          )
          res.sendStatus(200)
        })
        .catch(err => console.log(err));
    }
  })

}

async function refresh() {
  return await db.SMS.findAll({
    order: [
      ['id', 'DESC'],
    ],
  });

 }

//get batch items


const getItems = (req, res) => {
  db.sequelize.query(`CALL sp_allBatchItems('${req.params.batchNo}');`).then(function (data) {
    res.send(data);
  }).catch(function (err) {
    res.json(err)
  });

}
//GET TRX INFO
const getTrxInfo = (req, res) => {
  db.sequelize.query(`CALL 	sp_getTrxInfo('${req.params.trxNo}');`).then(function (data) {
    if (data.length === 0) {
      res.json({
        "code": -1,
        "receiver": "",
        "sender": "",
        "steps": ""
      });
    }
    res.json({
      "code": 200,
      "receiver": data[0].receiver,
      "sender": data[0].sender,
      "steps": data[0].steps.split(",")
    });
    res.json({});
  }).catch(function (err) {
    res.json(err)
  });

}

//get batch status
const getBatchStatus = (req, res) => {
  db.Items.findOne({
    where: {
      batch_num: req.params.batchNo
    },
    group: ['batch_num'],
    attributes: ['current_location'],
  }).then(data => {
    res.send(data);
  }).catch(err => res.send(err));
}

//get item status
const getItemStatus = (req, res) => {
  db.Items.findOne({
    where: {
      tracking_num: req.params.trackno
    },
    group: ['batch_num'],
    attributes: ['id','item_no','current_location','batch_num','phone_number','declared_item','weight','dimensions','isDelivered','quantity'], 
  }).then(data => {
    res.send(data);
  }).catch(err => res.send(err));
}
//update status
const updateStatus = (req, res) => {
  let curDate = moment().format();
  let trxDatetime = '';

  let status = req.body.status;
  let isBack = req.body.isBack;

  db.Items.findOne({
    where: {
      batch_num: req.params.batchNo
    },
    order: [['id', 'ASC']],
  }).then(val => {
    if(isBack === '1')
    {
      let splitTrxDT =  val.trxTimeStamp.split(",");
      let sliceTrxDT =  splitTrxDT.slice(0,-1);
       trxDatetime =sliceTrxDT.toString();
    }
    else
    {
      trxDatetime = val.trxTimeStamp === null ? curDate : `${val.trxTimeStamp},${curDate}`
    }

    db.Items.update({
      current_location: status,
      trxTimeStamp: trxDatetime
    }, {
      where: {
        batch_num: req.params.batchNo
      }
    }).then(() => {
      res.sendStatus(200);
    }).catch(err => console.log(err));

  }).catch(err =>
    res.send(err)
  );

}
//update Items
const updateItem = (req, res) => {

  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {



      db.Items.findOne({
        where: {
          id: req.body.id
        },
        attributes: ['sender', 'receiver'],
      }).then((data) => {

        let sender = req.body.sender;
        let receiver = req.body.receiver;
        if (sender.indexOf("*") !== -1) {
          sender = data.sender;
        }

        if (receiver.indexOf("*") !== -1) {
          receiver = data.receiver;
        }

        let item_no = req.body.item_no;
        let sender_payment = req.body.sender_payment;
        let receiver_payment = req.body.receiver_payment;
        let phone_number = req.body.phone_number;
        let declared_item = req.body.declared_item;
        let weight = req.body.weight;
        let dimensions = req.body.dimensions;
        let quantity = req.body.quantity;



        db.Items.update({
          item_no: item_no,
          sender: sender,
          sender_payment: sender_payment,
          receiver: receiver,
          receiver_payment: receiver_payment,
          phone_number: phone_number,
          declared_item: declared_item,
          weight: weight,
          dimensions: dimensions,
          quantity: quantity,
        }, {
          where: {
            id: req.params.id
          }
        }).then(() => {
          res.sendStatus(200);
        }).catch(err => console.log(err));

      })


    }
  })
}

//delete item
const deleteItem = (req, res) => {
  db.Items.destroy({
    where: {
      id: req.params.id
    }
  }).then(() => res.sendStatus(200)).catch(err => console.log(err));

}

//save bulk records

function saveBulkItems(req, res) {


  let data = req.body;
  data.forEach(val => {
   //save mobile no if not exist
   checkandSaveMobileIfExist(val.phone_number, val.receiver);
});

  let limits = data.length;
  db.Items.findAll({
    limit: limits,
    where: {
            hasItem: 0
          },
  }).then(x => {
     
    for (var i = 0; i <limits; i++) {
       let trxNo = x[i].clientTransactionNo;
       data[i].clientTransactionNo = trxNo;
    }

    for (var i = 0; i <limits; i++) {
      db.Items.update({
        item_no: data[i].item_no,
        sender: data[i].sender,
        sender_payment: data[i].sender_payment,
        receiver: data[i].receiver,
        receiver_payment: data[i].receiver_payment,
        phone_number: data[i].phone_number,
        declared_item: data[i].declared_item,
        weight: data[i].weight,
        dimensions: data[i].dimensions,
        quantity: data[i].quantity,
        tracking_num: data[i].tracking_num,
        batch_num: data[i].batch_num,
        trxTimeStamp: data[i].trxTimeStamp,
        isDelivered:data[i].isDelivered,
        hasItem: 1
      }, {
        where: {
          clientTransactionNo: data[i].clientTransactionNo
        }
      }).then(() => {
        res.sendStatus(200);
      }).catch(err => console.log(err));

   }
    

   }).catch(err => console.log('error' + err));



  // db.Items.bulkCreate(data).then(() => { // Notice: There are no arguments here, as of right now you'll have to...
  //   res.sendStatus(200);
  // }).then(Items => {
  //   console.log(Items) // ... in order to get the array of user objects
  // })

}

//get batch last item
const getBatchLastNo = (req, res) => {
  db.Items.findOne({
    where: {
      batch_num: req.params.batchNo
    },
    order: [['id', 'DESC']],
  }).then((data) => {
    res.send(`${data.item_no}`);
  }).catch(err => res.send('0'));
}
//get  last trx no
const getTrxLastNo = (req, res) => {
  db.Items.findOne({
    where: {
      batch_num: req.params.batchNo
    },
    order: [['id', 'DESC']],
  }).then((data) => {

    let yr = parseInt(moment().format('YY')) + 35;
    let m = parseInt(moment().format('MM')) * 8;
    let d = parseInt(moment().format('DD')) * 3;
    let lastTrxNo = parseInt(data === null ? 0 : data.item_no) + 999

    res.json({ clientTrxNo: `${yr}${m}${d < 10 ? '0' + d : d}${data === null ? '0' + lastTrxNo : lastTrxNo}` });
  }).catch(err => res.send('0'));
}

async function checkandSaveMobileIfExist(mobile, name) {
  db.sequelize.query(`CALL sp_insertRecipient('${mobile}','${name}');`);
}
//save record
function saveSingle(req, res) {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {

      let item_no = req.body.item_no;
      let sender = req.body.sender;
      let sender_payment = req.body.sender_payment;
      let receiver = req.body.receiver;
      let receiver_payment = req.body.receiver_payment;
      let phone_number = req.body.phone_number;
      let declared_item = req.body.declared_item;
      let weight = req.body.weight;
      let dimensions = req.body.dimensions;
      let quantity = req.body.quantity;
      let tracking_num = req.body.tracking_num;
      let batch_num = req.body.batch_num;
      let isDelivered = req.body.isDelivered;
      let clientTransactionNo = req.body.clientTransactionNo;
      let trxTimeStamp = req.body.trxTimeStamp;

      //save mobile no if not exist
      checkandSaveMobileIfExist(phone_number, receiver);

      db.Items.findOne({
        where: {
          batch_num: batch_num
        },
        order: [['id', 'ASC']],
      }).then(val => {
        trxTimeStamp = val === null ? trxTimeStamp : `${val.trxTimeStamp}`

        db.Items.update({
          item_no: item_no,
          sender: sender,
          sender_payment: sender_payment,
          receiver: receiver,
          receiver_payment: receiver_payment,
          phone_number: phone_number,
          declared_item: declared_item,
          weight: weight,
          dimensions: dimensions,
          quantity: quantity,
          tracking_num: tracking_num,
          batch_num: batch_num,
          trxTimeStamp: trxTimeStamp,
          isDelivered:isDelivered,
          hasItem: 1
        }, {
          where: {
            clientTransactionNo: clientTransactionNo
          }
        }).then(() => {
          res.sendStatus(200);
        }).catch(err => console.log(err));

      }).catch(err =>
        res.send(err)
      );

    }
  })

}

//get all batches
// const getAll = (req, res) => {

//   db.sequelize.query('CALL sp_allBatch();').then(function(response){
//     res.json(response);
//    }).catch(function(err){
//     res.json(err)
// });
//  }

 //get all batches
const getAll = (req, res) => {
//   db.Items.findAll({
//     // group: ['batch_num'],
//    order: [
//      ['id', 'DESC'],
//  ],
//   }).then(x => {
//      console.log(x);
//     res.send(x);
     
//    }).catch(err => console.log('error' + err));

jwt.verify(req.token, 'secretkey', (err, authData) => {
  if (err) {
    res.sendStatus(403);
  } else {

    db.sequelize.query('CALL sp_allBatch();').then(function (response) {
      res.json(response);
    }).catch(function (err) {
      res.json(err)
    });

  }
})
 
}
// //get batch items
// const getitems = (req, res) => {
//   db.Items.findAll({
//     where: {
//       batch_num: req.params.batchNo
//     },
//    order: [
//      ['item_no', 'ASC'],
//  ],
//   }).then((data) => {
//     res.send(data);
//   }).catch(err => console.log(err));

// }

//get batch items
const getAllItems = (req, res) => {
  db.Items.findAll({
    where: { hasItem: 1 }
  })
    .then((data) => res.send(data))
}
//get All Recipient
const getAllRecipient = (req, res) => {
  db.recipients.findAll()
    .then((data) => res.send(data))
}

// GET ITEM
const getItem = (req, res) => {
  db.Items.findAll({
    where: { id: req.params.ItemId }
  })
    .then((Item) => res.send(Item))
    .catch((err) => console.log(err));
};


// POST Item
// Add Item
const postAddItem = (req, res, next) => {
  let {
    item_no,
    sender,
    sender_payment,
    receiver,
    receiver_payment,
    tracking_num,
    batch_num,
    phone_number,
    declared_item,
    weight,
    dimensions,
    quantity,
    isDelivered,
    current_location,
  } = req.body;


  db.Items.create({
    item_no,
    sender,
    sender_payment,
    receiver,
    receiver_payment,
    tracking_num,
    batch_num,
    phone_number,
    declared_item,
    weight,
    dimensions,
    quantity,
    isDelivered,
    current_location,
  }).then((result) => {
    res.send(result);
  });
};


// GET edit item
const getEditItem = (req, res, next) => {
  // const itemId = req.params.ItemId;
  db.Items.findAll({ where: { id: req.params.ItemId } })
    .then((item) => res.send(item))
    .catch((err) => console.log(err));
};

const generateTrxNumber = (req, res, next) => {
  // const itemId = req.params.ItemId;
  db.Items.findOne({ where: { hasItem: 0 } })
    .then((item) => res.json({"trxNo":item.clientTransactionNo}))
    .catch((err) => res.json({"error":500}));
};

// POST edit item
const postEditItem = (req, res, next) => {
  const itemId = req.params.ItemId;
  db.Items.findOne({ where: { id: itemId } })
    .then((item) => {
      if (!item) {
        const error = new Error("Item not found.");
        error.statusCode = 404;
        throw error;
      }
      item.item_no = req.body.item_no;
      item.sender = req.body.sender;
      item.sender_payment = req.body.sender_payment;
      item.receiver = req.body.receiver;
      item.receiver_payment = req.body.receiver_payment;
      item.phone_number = req.body.phone_number;
      item.tracking_num = req.body.tracking_num;
      item.batch_num = req.body.batch_num;
      item.weight = req.body.weight;
      item.dimensions = req.body.dimensions;
      item.quantity = req.body.quantity;
      item.declared_item = req.body.declared_item;
      item.isDelivered = req.body.isDelivered;
      item.current_location = req.body.current_location;
      item.clientTransactionNo = req.body.clientTransactionNo;
      item.trxDatetime = req.body.trxDatetime;
      // item.userId = req.body.userId;
      return item.save();
    })
    .then((item) => res.send(item))
    // .then((result) => {
    //   res.status(200).json({ message: "updated." });
    // })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// 
const getBatchesList = (req, res, next) => {
  db.Items.findAll({
    attributes: ["batch_num"],
    group: ["batch_num"],
  }).then((Item) => res.send(Item));
};


// Upload Endpoint

const uploadFile = async (req, res) => {
  var filePath = "/Users/jdm0126/Documents/trackerApp/tracking_be/LetsBee-Tracker-Server";
  if (req.files === null) {
    return res.status(400).json({ msg: "No file uploaded" });
  }
  const results = [];
  const file = req.files.file;

  file.mv(`${filePath}/public/uploads/${file.name}`, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    res.json({ fileName: file.name, filePath: `/public/uploads/${file.name}` });
  });

  fs.createReadStream(`${filePath}/public/uploads/${file.name}`)
    .pipe(csv.parse({ headers: true }))
    .on("data", (row) => results.push(row))
    .on("end", () => {
      db.Items.bulkCreate(results);
    });
};

//update item status
const updateItemStatus = (req, res) => {

  let curDate = moment().format();

  db.Items.findOne({
    where: {
      clientTransactionNo: req.params.clientTrxNo
    }
  }).then(val => {
    let trxDatetime = `${val.trxTimeStamp},${curDate}`

    db.Items.update({
      current_location: '4',
      trxTimeStamp: trxDatetime
    }, {
      where: {
        clientTransactionNo: req.params.clientTrxNo
      }
    }).then(() => {
      res.sendStatus(200);
    }).catch(err => console.log(err));

  }).catch(err =>
    res.send(err)
  );

}


//update Sent Status
const updateSentStatus = (req, res) => {
  db.Items.update({
    isSent: '1',
  }, {
    where: {
      clientTransactionNo: req.params.clientTrxNo
    }
  }).then(() => {
    res.sendStatus(200);
  }).catch(err => console.log(err));
}

//reset Sent Status
const updateSentStatusbyBatch = (req, res) => {
  db.Items.update({
    isSent: req.body.status,
  }, {
    where: {
      batch_num: req.params.batchNo
    }
  }).then(() => {
    res.sendStatus(200);
  }).catch(err => console.log(err));
}


  const generateTransactionNo = (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      let rowToGenerate = req.body.rows - 1;
      db.sequelize.query(`CALL sp_generate_trx_number(${rowToGenerate})`).then(function (data) {
        res.sendStatus(200).json({"status":"ok"});
      }).catch(function (err) {
        res.json(err)
      });
    }
  })

}

module.exports = {
  getAll,
  getItems,
  updateItem,
  deleteItem,
  saveBulkItems,
  getBatchLastNo,
  saveSingle,
  getItem,
  getAllItems,
  getEditItem,
  getBatchesList,
  postEditItem,
  uploadFile,
  postAddItem,
  getBatchStatus,
  getItemStatus,
  getTrxInfo,
  getTrxLastNo,
  updateSentStatus,
  updateSentStatusbyBatch,

  sendSMS,
  updateStatus,
  updateItemStatus,

  getAllRecipient,
  generateTrxNumber,
  generateTransactionNo
}