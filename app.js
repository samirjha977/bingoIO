const express = require('express');
const http = require('http');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require("cors")

const { validateToken } = require('./validateToken');

var allowedOrigins = ['http://localhost:3000',
                      'http://167.224.231.245',
                      'http://bingomingo.s3-website-us-west-2.amazonaws.com/'];

// Create Express App
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.set('port', process.env.PORT || 3052);

//view engine setup


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

const IO_Transport = io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', (reason) => {
    console.log('user disconnected', reason);
  });
});

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/', function (req, res){
res.send("Error").status(404);
});


app.post('/broadcastGameOver', validateToken, function (req, res) {
  const gameName = req.body.data.gameKey;
  let obj = {gameKey: gameName}
  IO_Transport.emit('gameover', JSON.stringify(obj));
  res.send({ code: 0 });
});

app.post('/BlackOut', validateToken, function (req, res) {
  const data = req.body.data;
  IO_Transport.emit('BlackOut', JSON.stringify(data));
  res.send({ code: 0 });
});

app.post('/bingoBroadcast', validateToken, function (req, res) {
  const data = req.body.data;
  IO_Transport.emit('bingo', JSON.stringify(data));
  res.send({ code: 0 });
});


app.post('/broadcastPlayers', validateToken, function (req, res) {
  const gameName = req.body.data.gameName;
  const players = req.body.data.players;
  let obj = {gameKey: gameName, players: players}
  IO_Transport.emit('playerJoined', JSON.stringify(obj));
  res.send({ code: 0 });
});
