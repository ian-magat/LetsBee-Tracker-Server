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
        dateSent:curdate
      })
        .then(() => {
          let ref = refresh();
    ref.then((data) => 
      global.io.emit('reload',data)
    )
          res.sendStatus(200)
        })
        .catch(err => console.log(err));
    }
})
  
}
 
async function  refresh(){
 return await db.SMS.findAll({
   order: [
     ['id', 'DESC'],
 ],
  });

 }

 const { Op } = require('sequelize');
 const getAllbyDate = (req, res) => {

  let from = moment(req.body.from).format('YYYY-MM-DD');
  let to = moment(req.body.to).format('YYYY-MM-DD');
switch(req.body.type)
{
  case "inbound":
  case "outbound" :
  
    db.SMS.findAll({
      where: {
        createdAt: {
          [Op.between]: [`${from}T00:00:00.000Z`, `${to}T00:00:00.000Z`]
        },
        type: req.body.type
      } ,
     order: [
       ['id', 'DESC'],
   ],
    }).then(x => {
       console.log(x);
      res.send(x);
       
     }).catch(err => console.log('error' + err));
  return;

  case "all" :
  db.SMS.findAll({
    where: {
      createdAt: {
        [Op.between]: [`${from}T00:00:00.000Z`, `${to}T00:00:00.000Z`]
      },
    } ,
   order: [
     ['id', 'DESC'],
 ],
  }).then(x => {
     console.log(x);
    res.send(x);
     
   }).catch(err => console.log('error' + err));

  return;
}
  
 }
const inboundSMS = (req, res) => {
 db.SMS.findAll({
  where: {
    type: 'inbound'
  } ,
  order: [
    ['id', 'DESC'],
],
 }).then(x => {
    console.log(x);
    res.send(x);
    
  }).catch(err => console.log('error' + err));
}
const outboundSMS = (req, res) => {
 db.SMS.findAll({
  where: {
    type: 'outbound'
  } ,
  order: [
    ['id', 'DESC'],
],

 }).then(x => {
    console.log(x);
    res.send(x);
    
  }).catch(err => console.log('error' + err));
}

const updateStatus = (req, res) => {
  let status = req.body.status;
  db.SMS.update({
    status: status,
  }, {
    where: {
      id: req.params.id
    }
  }).then(() => {
    let ref = refresh();
    ref.then((data) => 
      global.io.emit('reload',data)
    )
    res.sendStatus(200);
  }).catch(err => console.log(err));

}

const deleteSMS = (req, res) => {
  db.SMS.destroy({
    where: {
      id: req.params.id
    }
  }).then(() => res.sendStatus(200)).catch(err => console.log(err));

}

//get all batches
const getAll = (req, res) => {
  db.Items.findAll({
    group: ['batch_num'],
   order: [
     ['id', 'DESC'],
 ],
  }).then(x => {
     console.log(x);
    res.send(x);
     
   }).catch(err => console.log('error' + err));

 }
//get batch items
const getitems = (req, res) => {
  db.Items.findAll({
    where: {
      batch_num: req.params.batchNo
    },
   order: [
     ['item_no', 'ASC'],
 ],
  }).then((data) => {
    res.send(data);
  }).catch(err => console.log(err));

}

//get batch items
const getAllItems = (req, res) => {
  db.Items.findAll()
  .then((data) => res.send(data))

}

// GET ITEM
const getItem = (req, res) => {
  db.Items.findAll({ 
    where: { id: req.params.ItemId } })
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
    current_location,
  }).then((result) => {
    res.send(result);
  });
};



// delete item with id
 const deleteItemId = (req, res) => {
  db.Items.destroy({ where: { id: req.params.ItemId } })
    .then((status => res.sendStatus(200)))
    .catch(err => console.log(err));
};

// GET edit item
const getEditItem = (req, res, next) => {
  // const itemId = req.params.ItemId;
  db.Items.findAll({ where: { id: req.params.ItemId } })
    .then((item) => res.send(item))
    .catch((err) => console.log(err));
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
      item.current_location = req.body.current_location;
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


module.exports = {
  getAll,
  getitems,
  getItem,
  getAllItems,
  deleteItemId,
  getEditItem,
  getBatchesList,
  postEditItem,
  uploadFile,
  postAddItem,

  inboundSMS,
  deleteSMS,
  sendSMS,
  updateStatus,
  outboundSMS,
  getAllbyDate
}