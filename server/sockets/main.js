const gameEngine = require('./game/engine.js');
const _ = require('lodash');

module.exports = {
  init
};

///

let socketList = [];

function init(io) {

  io.sockets.on('connection', (socket) => {
    socket.room = 'room1';
    socket.join(socket.room);

    socketList.push(socket);

    socket.emit('updateBattleField',
      gameEngine.getBattleFieldSnapshot()
    );

    socket.on('keyUpdate', _updateKeys);

    socket.on('disconnect', () => {
      _.remove(socketList, (item) => item === socket);
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
    })
}

function _updateKeys(keys) {
  gameEngine.updateKeys(keys);
}
