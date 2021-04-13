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
var bcrypt = require("bcryptjs");

async function getAllAnnouncement(req, res) {

  await db.announcement.findAll().then(data => {
    res.send(data);
  }).catch(err => console.log('error' + err));

}

function SaveAnnouncement(req, res) {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      let title = req.body.title;
      let value = req.body.value;

      db.announcement.create({
        title: title,
        value: value,
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

const updateAnnouncement = (req, res) => {

  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {

      let title = req.body.title;
      let value = req.body.value;

      db.announcement.update({
        title: title,
        value: value,
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
const deleteAnnouncement = (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      db.announcement.destroy({
        where: {
          id: req.params.id
        }
      }).then(() => res.sendStatus(200)).catch(err => console.log(err));
    }
  })


}

const getSelectedTemplate = (req, res) => {
  db.announcement.findOne({
    where: {
      isSelected: 1
    },
  }).then(data => {
    res.send(data);
  }).catch(err =>  res.status(500).json({
    "status_code" : 500
  }));
}

const updateSelectedTemplate = (req, res) => {

  db.announcement.findOne({
    where: {
      isSelected: 1
    },
  }).then(data => {
    if (data === null) {
      updateSelectedAnnouncement(res, req.params.id);
      return;
    }
    db.announcement.update({
      isSelected: 0,
    }, {
      where: {
        id: data.id
      }
    }).then(() => {

      updateSelectedAnnouncement(res, req.params.id);

    }).catch(err => console.log(err));
  }).catch(err => res.send(err));

}
function updateSelectedAnnouncement(res, id) {
  db.announcement.update({
    isSelected: 1
  }, {
    where: {
      id: id
    }
  }).then(() => {
    res.sendStatus(200);
  })
}
module.exports = {
  getAllAnnouncement,
  SaveAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getSelectedTemplate,
  updateSelectedTemplate
}