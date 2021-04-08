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

async function GetAllCurrency(req, res) {
  await db.currency.findAll().then(x => {
    res.status(200).json(x);
  }).catch(err => console.log('error' + err));

}

function SaveCurrency(req, res) {

  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      let peso = req.body.peso;
      let won = req.body.won;

      db.currency.create({
        peso: peso,
        won: won,
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

const UpdateCurrency = (req, res) => {

  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {

      let peso = req.body.peso;
      let won = req.body.won;

      db.currency.update({
        peso: peso,
        won: won,
      }, {
        where: {
          id: 1
        }
      }).then(() => {
        res.sendStatus(200);
      }).catch(err => console.log(err));

    }
  })
} 
async function CalculateShippingFee(req, res) {
  await db.currency.findOne().then(x => {
    let peso = x.peso;
    let won = x.won;

    let weight = Math.ceil(req.body.weight);
    let length  = req.body.length ;
    let width  = req.body.width ;
    let height = req.body.height;

    let feeByWeightPeso = weight * peso;
    let feeByWeightPesoSplit = feeByWeightPeso.toString().split(".");
    let feeByWeightWon = weight * won;
    let feeByWeightWonSplit = feeByWeightWon.toString().split(".");

    let feeBySizePeso = (length * width * height) / 5000 * peso;
    let feeBySizePesoSplit = feeBySizePeso.toString().split(".");
    let feeBySizeWon = (length * width * height) / 5000 * won;
    let feeBySizeWonSplit = feeBySizeWon.toString().split(".");

    if (feeByWeightPeso > feeBySizePeso) {
      res.status(200).json({
        "Shipping fee (Ph Peso)":feeByWeightPesoSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        "Shipping fee (Kor Won)":feeByWeightWonSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      });
    }
    else
    {
      res.status(200).json({
        "Shipping fee (Ph Peso)":feeBySizePesoSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        "Shipping fee (Kor Won)":feeBySizeWonSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      });
    }
  }).catch(err => console.log('error' + err));

}
module.exports = {
  GetAllCurrency,
  SaveCurrency,
  UpdateCurrency,
  CalculateShippingFee
}