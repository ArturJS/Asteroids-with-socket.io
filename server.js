const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3333;

const serverPrefixPath = './server/';

// import middlewares
const corsMiddleware = require(`${serverPrefixPath}middlewares/cors.middleware.js`);
const noCacheMiddleware = require(`${serverPrefixPath}middlewares/no-cache.midleware.js`);

// import routes
const apiRoute = require(`${serverPrefixPath}routes/api.route.js`);

// init parsers
app.use(bodyParser.urlencoded({limit: '25mb', extended: false}));
app.use(bodyParser.json({limit: '25mb'}));

// init middlewares
app.use(corsMiddleware);
app.use(noCacheMiddleware);

// init routes
app.use('/api', apiRoute);


//==========Socket.IO===========
const _ = require('lodash');

let socketList = [];
let keys = {
  left: 0,
  right: 0,
  up: 0,
  space: 0
};

io.sockets.on('connection', (socket) => {
  socket.room = 'room1';
  socket.join(socket.room);

  socketList.push(socket);

  socket.on('keyUpdate', updateKeys);


  socket.on('disconnect', () => {
    _.remove(socketList, (item) => item === socket);
  });
});

http.listen(port, () => {
  console.log('listening on *:' + port);
  runGameCircle();
});

console.log(`NODE_API listening on http://localhost:${port}/`);


// todo move into separate controller

function runGameCircle() {
  setInterval(() => {
    updateShipData(keys); // todo update particular shipData

    _.each(socketList, (socket) => {
      socket.emit('updateBattleField', {
        position: position,
        rotation: rotation
      });
    });
  }, 1000 / 60);
}

function updateKeys(newKeys) {
  keys = newKeys;
}

/// Ship
const screen = {
  width: 900,
  height: 600
};

let position = {
  x: 450,
  y: 300
};
let rotation = 0;

let velocity = {
  x: 0,
  y: 0
};

let rotationSpeed = 6;
let speed = 0.15;
let inertia = 0.99;

function updateShipData(keys) {
  if (keys.up) {
    accelerate();
  }
  if (keys.left) {
    rotate('LEFT');
  }
  if (keys.right) {
    rotate('RIGHT');
  }

  // Move (server.js)
  position.x += velocity.x;
  position.y += velocity.y;
  velocity.x *= inertia;
  velocity.y *= inertia;

  // Rotation (server.js)
  if (rotation >= 360) {
    rotation -= 360;
  }
  if (rotation < 0) {
    rotation += 360;
  }

  // Screen edges (server.js)
  if (position.x > screen.width) position.x = 0;
  else if (position.x < 0) position.x = screen.width;
  if (position.y > screen.height) position.y = 0;
  else if (position.y < 0) position.y = screen.height;
}

function rotate(dir) {
  if (dir === 'LEFT') {
    rotation -= rotationSpeed;
  }
  if (dir === 'RIGHT') {
    rotation += rotationSpeed;
  }
}

function accelerate() {
  velocity.x -= Math.sin(-rotation * Math.PI / 180) * speed;
  velocity.y -= Math.cos(-rotation * Math.PI / 180) * speed;
}
