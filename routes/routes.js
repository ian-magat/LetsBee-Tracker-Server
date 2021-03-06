const express = require('express');
const router = express.Router();
const app = express();
const Controller = require('../controllers/SMSController');
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');
const {validate} = require('../helper/validator');
const upload = require('../services/file-upload');

const ItemsController = require('../controllers/ItemsController');
const AnnouncementController = require('../controllers/AnnouncementController');
const CurrencyController = require('../controllers/CurrencyController');



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
  
router.get('/',verifyToken,ItemsController.getAll)
router.get('/api/item', ItemsController.getAllItems);
router.get('/api/item/:ItemId', ItemsController.getItem);
router.get('/api/getBatchItems/:batchNo',ItemsController.getItems);
router.post('/api/updateStatus/:batchNo',ItemsController.updateStatus);
router.post('/api/updateItem/:id',verifyToken,ItemsController.updateItem);
router.delete('/api/deleteItem/:id',ItemsController.deleteItem)
router.post('/api/saveImportedData',ItemsController.saveBulkItems);
router.post('/api/saveSingleData',verifyToken,ItemsController.saveSingle);
router.get('/api/getBatchLastNo/:batchNo',ItemsController.getBatchLastNo);
router.get('/api/getBatchStatus/:batchNo',ItemsController.getBatchStatus);
router.get('/api/getTrxInfo/:trxNo',ItemsController.getTrxInfo);
router.get('/api/getTrxLastNo/:batchNo',ItemsController.getTrxLastNo);
router.post('/api/updateItemStatus/:clientTrxNo',ItemsController.updateItemStatus);
router.post('/api/updateSentStatusbyBatch/:batchNo',ItemsController.updateSentStatusbyBatch);
router.get('/api/generateTrxNumber', ItemsController.generateTrxNumber);
router.post('/api/generateDBtrxNo',verifyToken,ItemsController.generateTransactionNo);

router.get('/api/allRecipient', ItemsController.getAllRecipient);

router.get('/api/getItemStatus/:trackno',ItemsController.getItemStatus);

router.get('/api/batchNum/batch', ItemsController.getBatchesList)

router.post('/api/item/add', ItemsController.postAddItem);
router.get('/api/edit/:ItemId', ItemsController.getEditItem);
router.patch('/api/edit/:ItemId', ItemsController.postEditItem);

router.post('/api/upload', ItemsController.uploadFile);

router.post('/api/updateSentStatus/:clientTrxNo',ItemsController.updateSentStatus);
// end Item Controllers

router.post('/api/GetSMSbyDate',Controller.getAllbyDate)
router.get('/api/inboundSMS',Controller.inboundSMS)
router.get('/api/outboundSMS',Controller.outboundSMS)
router.post('/api/sendSMS',verifyToken,Controller.sendSMS)
router.get('/api/smsReference',Controller.getSMSReferenceMessage)


router.delete('/api/deleteRider/:id',Controller.deleteSMS)
router.get('/api/allUsers',UserController.getAllUser)
router.post('/api/saveUser',verifyToken,UserController.SaveUser);
router.delete('/api/deleteUser/:id',UserController.Delete)
router.post('/api/updateProfile/:id',verifyToken,UserController.updateProfile);
router.post('/api/updatePassword/:id',verifyToken,UserController.updatePassword);
router.post('/api/updateUser/:id',verifyToken,UserController.updateUser);


router.delete('/api/deleteRecipient/:id',Controller.deleteRecipient)
router.post('/api/updateRecipient/:id',verifyToken,Controller.updateRecipient);

router.post('/api/login',AuthController.login);

router.get('/api/announcements', AnnouncementController.getAllAnnouncement);
router.post('/api/saveAnnouncement',verifyToken,AnnouncementController.SaveAnnouncement);
router.post('/api/updateAnnouncement/:id',verifyToken,AnnouncementController.updateAnnouncement);
router.delete('/api/deleteAnnouncement/:id',verifyToken,AnnouncementController.deleteAnnouncement)
router.get('/api/getSelectedTemplate', AnnouncementController.getSelectedTemplate);
router.post('/api/updateSelectedTemplate/:id',AnnouncementController.updateSelectedTemplate);

// shipment calculator
router.get('/api/currencies', CurrencyController.GetAllCurrency);
router.post('/api/saveCurrencies',verifyToken,CurrencyController.SaveCurrency);
router.post('/api/updateCurrencies',verifyToken,CurrencyController.UpdateCurrency);
router.post('/api/CalculateShippingFee',validate('calculateFee'),CurrencyController.CalculateShippingFee);


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