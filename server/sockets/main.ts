import gameEngine from '../game/engine';
import * as _ from 'lodash';
import * as socketioJwt from 'socketio-jwt';
import config from '../config/config';

const jwtSecret = config.jwtSecret;

export default {
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
    gameEngine.addShip(userId, roomId);

    socketList.push(socket);

    socket.emit('updateBattleField',
      gameEngine.getBattleFieldSnapshot(roomId)
    );

    socket.on('keyUpdate', _updateKeys(userId));

    socket.on('disconnect', () => {
      _.remove(socketList, (item) => item === socket);
      gameEngine.removeShip(userId, roomId);
    });
  });

  _initGame(io);
}

/// private methods


function _initGame(io) {
  gameEngine.runGameCircle()
    .on('updateBattleField', (battleFieldData, roomId) => {
      io.sockets.in(roomId)
        .emit('updateBattleField', battleFieldData);
    });
}

function _updateKeys(userId) {
  return (keys) => {
    gameEngine.updateKeys(userId, keys);
  };
}
