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

const getAll = (req, res) => {
  db.SMS.findAll({
   order: [
     ['id', 'DESC'],
 ],
  }).then(x => {
     console.log(x);
    res.send(x);
     
   }).catch(err => console.log('error' + err));

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


module.exports = {
  inboundSMS,
  deleteSMS,
  sendSMS,
  updateStatus,
  outboundSMS,
  getAll,
  getAllbyDate
}