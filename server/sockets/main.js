const gameEngine = require('./game/engine.js');
const _ = require('lodash');
const socketioJwt = require("socketio-jwt");
const jwtSecret = require('../config/config.js').jwtSecret;

module.exports = {
  init
};

///

let socketList = [];

function init(io) {

  io.use(socketioJwt.authorize({
    secret: jwtSecret,
    handshake: true
  }));

  io.sockets.on('connection', (socket) => {
    const {roomId} = socket.handshake.query;
    const {userId} = socket.decoded_token;

    socket.join(roomId);
    gameEngine.addShip(userId);

    socketList.push(socket);

    socket.emit('updateBattleField',
      gameEngine.getBattleFieldSnapshot()
    );

    socket.on('keyUpdate', _updateKeys(userId));

    socket.on('disconnect', () => {
      _.remove(socketList, (item) => item === socket);
      gameEngine.removeShip(userId);
    });
  });

  _initGame();
}

/// private methods


function _initGame() {
  gameEngine.runGameCircle()
    .on('updateBattleField', (battleFieldData) => {
      _.each(socketList, (socket) => {
        socket.emit('updateBattleField', battleFieldData);
      });
    });
}

function _updateKeys(userId) {
  return (keys) => {
    gameEngine.updateKeys(userId, keys);
  };
}
