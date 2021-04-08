const express = require('express');
const app = express();
app.use(express.json());
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require('./routes/routes')
const db = require("./models");
const http = require('http');
const socketIO = require('socket.io');

// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initializeDB()
// });


let server = http.createServer(app);
var io = socketIO(server);
global.io = io; //added
// io.on('connection', (socket) => {
  

//  db.SMS.findAll().then(x => {
//     socket.emit('message',x)
//   });

//   console.log("a new user just connected"); 
  

//   socket.on('disconnect', () => {
//     console.log("user was disconnected");
//   })

// })
 
async function  refresh(){
  return await db.SMS.findAll({
    order: [
      ['id', 'DESC'],
  ],
   });
 
  }

  

    

io.on('connection',(socket) =>{
  socket.on('ferret', function (name, fn) {
    let ref = refresh();
    ref.then((data) => 
    fn(data)
  )
  });
  console.log("a new user just connected" );
  
  socket.on('allRecords', function (msg) {
    let ref = refresh();
      ref.then((data) => 
        io.emit('allRecords',data)
      )
 });

  socket.on('disconnect',(socket) =>{
    console.log("Disconnected from server" );
  })
})
 function initializeDB() {
  db.users.create({
  firstName: 'admin',
  lastName: 'admin',
  username: 'admin',
    password: '$2a$08$htwpl/BN60ARnlrnrePXLedFq.maLNPPaDC6SJG.lRvQu0JyyXgMC',
    isAdmin: 1
  });

   db.smsReference.bulkCreate([
     {
       status: '0',
       value: '현재 고객님의 물품이 한국사무실에 입고되었습니다.\nYour shipment has arrived at the Korea Office. '
     },
     {
       status: '1',
       value: '현재 고객님의 물품이 국내 항공사에 입고되었습니다.\nYour shipment has been loaded in the airplane.'
     },
     {
       status: '2',
       value: '현재 고객님의 물품이 필리핀에서 통관 중입니다.\nYour shipment is on process at the customs.'
     },
     {
       status: '3',
       value: '현재 고객님의 물품이 통관되어 배송중입니다.\nYour shipment is on delivery.'
     },
     {
       status: '4',
       value: '고객님의 물품이 배송완료되었습니다.\nYour shipment is delivered successfully.'
     }
   ]);

   db.currency.create({
    peso: 540 ,
    won: 13000,
  })
 }

console.log(__dirname + "/./public")
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,DELETE,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use('/public', express.static('public'));
  // app.use('/upload', express.static('upload'));
  // app.use('/rideradminpanel', express.static('rideradminpanel'));

app.use('/',routes);
const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`Listening to port ${port}`));