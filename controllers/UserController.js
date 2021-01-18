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

async function getAllUser(req, res) {

  await db.users.findAll({ attributes: ['id', 'firstName', 'lastName', 'username'], }).then(x => {
    res.status(200).json(x);
  }).catch(err => console.log('error' + err));

}

function SaveUser(req, res) {

  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      let firstName = req.body.firstName;
      let lastName = req.body.lastName;
      let username = req.body.userName;
      let password = bcrypt.hashSync(req.body.password, 8);

      db.users.create({
        firstName: firstName,
        lastName: lastName,
        username: username,
        password: password,
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

const updateProfile = (req, res) => {

  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {

      let firstName = req.body.firstName;
      let lastName = req.body.lastName;
      let username = req.body.userName;

      db.users.update({
        firstName: firstName,
        lastName: lastName,
        username: username,
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
const updateUser = (req, res) => {

  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {

      let firstName = req.body.firstName;
      let lastName = req.body.lastName;
      let username = req.body.userName;
      let password = bcrypt.hashSync(req.body.password, 8);

      db.users.update({
        firstName: firstName,
        lastName: lastName,
        username: username,
      }, {
        where: {
          id: req.params.id
        }
      }).then(() => {
        if (req.body.password !== '') {
          db.users.update({
            password: password,
          }, {
            where: {
              id: req.params.id
            }
          })
        }

        res.sendStatus(200);
      }).catch(err => console.log(err));

    }
  })




}

const updatePassword = (req, res) => {

  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {

      let password = bcrypt.hashSync(req.body.password, 8);

      db.users.update({
        password: password,
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
const Delete = (req, res) => {
  db.users.destroy({
    where: {
      id: req.params.id
    }
  }).then(() => res.sendStatus(200)).catch(err => console.log(err));

}

module.exports = {
  SaveUser,
  getAllUser,
  Delete,
  updateProfile,
  updatePassword,
  updateUser
}