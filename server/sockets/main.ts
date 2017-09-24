import gameEngine from '../game/main';
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
    const {
      userId,
      login
    } = socket.decoded_token;

    socket.join(roomId);
    gameEngine.addShip({playerId: userId, login}, roomId);

    socketList.push(socket);

    socket.emit('updateBattleField',
      gameEngine.getBattleFieldSnapshot(roomId)
    );

    socket.on('keyUpdate', _updateKeys(roomId, userId));

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

function _updateKeys(roomId, userId) {
  return (keys) => {
    gameEngine.updateKeys(roomId, userId, keys);
  };
}
