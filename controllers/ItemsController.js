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
//get all batches
const getAll = (req, res) => {

  db.sequelize.query('CALL sp_allBatch();').then(function(response){
    res.send(response);
   }).catch(err => send('error' + err));

//   db.Items.findAll({
//     group: ['batch_num'],
//    order: [
//      ['id', 'DESC'],
//  ],
//   }).then(x => {
//      console.log(x);
//     res.send(x);
     
//    }).catch(err => console.log('error' + err));

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
//update status
const updateStatus = (req, res) => {
  let status = req.body.status;
  db.Items.update({
    current_location: status,
  }, {
    where: {
      batch_num: req.params.batchNo
    }
  }).then(() => {
    res.sendStatus(200);
  }).catch(err => console.log(err));

}
//update Items
const updateItem = (req, res) => {

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

  db.Items.bulkCreate(data).then(() => { // Notice: There are no arguments here, as of right now you'll have to...
  res.sendStatus(200);
  }).then(Items => {
    console.log(Items) // ... in order to get the array of user objects
  })

}

//get batch last item
const getBatchLastNo = (req, res) => {
  db.Items.findOne({
    where: {
      batch_num: req.params.batchNo
    } ,
    order: [ [ 'id', 'DESC' ]],
}).then((data) => {
    res.send(`${data.item_no}`);
  }).catch(err => res.send('0'));
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


      db.Items.create({
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
      })
        .then(() => {
          res.sendStatus(200)
        })
        .catch(err => {
          console.log(err)
        });
    }
  })

}


module.exports = {
  getAll,
  getitems,
  updateItem,
  deleteItem,
  saveBulkItems,
  getBatchLastNo,
  saveSingle,

  sendSMS,
  updateStatus,
}