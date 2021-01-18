const {check, validationResult} = require('express-validator');
const express = require('express');
const app = express();

exports.validateUser = [
    check('firstName')
      .isEmpty()
      .withMessage('first name can not be empty!')
      .bail(),
    (req, res, next) => {
        console.log(req);
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return console.log(errors);
      next();
    },
  ];