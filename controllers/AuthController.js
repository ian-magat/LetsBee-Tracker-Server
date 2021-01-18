const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
app.use(cors());
const db = require("../models");
const jwt = require('jsonwebtoken');
var bcrypt = require("bcryptjs");

function login(req, res) {
 db.users.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ status: 404, message: "User Not found." });
        }

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({ status: 401, message: "Invalid Password!", code: 2000 });
        }

        return jwt.sign({ user: user }, 'secretkey', (err, token) => {
            res.send({
                id: user.id,
                token: token,
                isAdmin:user.isAdmin,
                firstName:user.firstName ,
                lastName :user.lastName ,
                userName :user.username  ,
            })
        });

    }).catch(err => {
        return res.status(500).send({ status: 500, message: err.message, code: 1000 });
    });

}


module.exports = {
    login
}