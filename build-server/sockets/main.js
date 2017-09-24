"use strict";
exports.__esModule = true;
var main_1 = require("../game/main");
var _ = require("lodash");
var socketioJwt = require("socketio-jwt");
var config_1 = require("../config/config");
var jwtSecret = config_1["default"].jwtSecret;
exports["default"] = {
    init: init
};
///
var socketList = [];
function init(io) {
    io.use(socketioJwt.authorize({
        secret: jwtSecret,
        handshake: true
    }));
    io.sockets.on('connection', function (socket) {
        var roomId = socket.handshake.query.roomId;
        var _a = socket.decoded_token, userId = _a.userId, login = _a.login;
        socket.join(roomId);
        main_1["default"].addShip({ playerId: userId, login: login }, roomId);
        socketList.push(socket);
        socket.emit('updateBattleField', main_1["default"].getBattleFieldSnapshot(roomId));
        socket.on('keyUpdate', _updateKeys(roomId, userId));
        socket.on('disconnect', function () {
            _.remove(socketList, function (item) { return item === socket; });
            main_1["default"].removeShip(userId, roomId);
        });
    });
    _initGame(io);
}
/// private methods
function _initGame(io) {
    main_1["default"].runGameCircle()
        .on('updateBattleField', function (battleFieldData, roomId) {
        io.sockets["in"](roomId)
            .emit('updateBattleField', battleFieldData);
    });
}
function _updateKeys(roomId, userId) {
    return function (keys) {
        main_1["default"].updateKeys(roomId, userId, keys);
    };
}
