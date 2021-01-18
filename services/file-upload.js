const aws = require('aws-sdk')
const express = require('express')
const multer = require('multer')
const multerS3 = require('multer-s3')
 
aws.config.update({
    secretAccessKey:'IBEZVggbt81dNieK1nrmPSou8UVDd0Zwzh338VPx',
    accessKeyId:'AKIAI36U5HBGLIZ2IADQ',
    region:'us-east-2',
})
var s3 = new aws.S3({ })
 
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'upload-files-ids/uploads',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
    cb(null, 'testing' + ".jpg")
    } 
  })
})

module.exports = upload;