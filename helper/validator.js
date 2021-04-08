const {check, validationResult} = require('express-validator');
const express = require('express');
const app = express();
const { body } = require('express-validator/check')
exports.validate = (method) => {
  switch (method) {
    case 'calculateFee': {
     return [ 
        body('weight', 'weight doesnt exists').exists(),
        body('length', 'length doesnt exists').exists(),
        body('width', 'width doesnt exists').exists(),
        body('height', 'height doesnt exists').exists(),
       ]   
    }
  }
}