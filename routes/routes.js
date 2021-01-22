const express = require('express');
const router = express.Router();
const app = express();
const Controller = require('../controllers/SMSController');
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');
const {validateUser} = require('../helper/validator');
const upload = require('../services/file-upload');

const ItemsController = require('../controllers/ItemsController');



const singleUpload = upload.single('image');

app.use(express.json());
const cors = require("cors");
const multer  = require('multer');
 
app.use(cors());
  router.post('/api/imageUpload',function(req,res){
    singleUpload(req,res, function(err){
    return  res.json({'imageUrl': req.file.location})
    });
  })
  
router.get('/',ItemsController.getAll)
router.get('/api/item', ItemsController.getAllItems);
router.get('/api/item/:ItemId', ItemsController.getItem);
router.get('/api/getBatchItems/:batchNo',ItemsController.getItems);
router.post('/api/updateStatus/:batchNo',ItemsController.updateStatus);
router.post('/api/updateItem/:id',verifyToken,ItemsController.updateItem);
router.delete('/api/deleteItem/:id',ItemsController.deleteItem)
router.post('/api/saveImportedData',ItemsController.saveBulkItems);
router.post('/api/saveSingleData',verifyToken,ItemsController.saveSingle);
router.get('/api/getBatchLastNo/:batchNo',ItemsController.getBatchLastNo);



router.get('/api/batchNum/batch', ItemsController.getBatchesList)

router.post('/api/item/add', ItemsController.postAddItem);
router.get('/api/edit/:ItemId', ItemsController.getEditItem);
router.patch('/api/edit/:ItemId', ItemsController.postEditItem);

router.post('/api/upload', ItemsController.uploadFile);

// end Item Controllers

router.post('/api/GetSMSbyDate',Controller.getAllbyDate)
router.get('/api/inboundSMS',Controller.inboundSMS)
router.get('/api/outboundSMS',Controller.outboundSMS)
router.post('/api/sendSMS',verifyToken,Controller.sendSMS)


router.delete('/api/deleteRider/:id',Controller.deleteSMS)
router.get('/api/allUsers',UserController.getAllUser)
router.post('/api/saveUser',verifyToken,UserController.SaveUser);
router.delete('/api/deleteUser/:id',UserController.Delete)
router.post('/api/updateProfile/:id',verifyToken,UserController.updateProfile);
router.post('/api/updatePassword/:id',verifyToken,UserController.updatePassword);
router.post('/api/updateUser/:id',verifyToken,UserController.updateUser);

router.post('/api/login',AuthController.login);
function verifyToken(req,res,next)
{
  const bearerHeader = req.headers["authorization"];
if (bearerHeader) {
  const bearer = bearerHeader.split(' ');
  const bearerToken = bearer[1];
  req.token = bearerToken;

  next();
}
else
{
  res.send('unauthorized');
  console.log('unauthorized');
}

}
module.exports = router;