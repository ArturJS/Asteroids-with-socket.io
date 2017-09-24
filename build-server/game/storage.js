"use strict";
exports.__esModule = true;
var entities_1 = require("./entities");
exports["default"] = {
    getStorageData: getStorageData,
    setStorageData: setStorageData,
    updateKeys: updateKeys,
    addShip: addShip,
    removeShip: removeShip
};
///
var _roomBattleMap = new Map();
function getStorageData() {
    return _roomBattleMap;
}
function setStorageData(roomBattleMap) {
    _roomBattleMap = roomBattleMap;
}
function updateKeys(roomId, playerId, keys) {
    var room = _roomBattleMap.get(roomId);
    if (room && room.players.has(playerId)) {
        room.players.get(playerId).keys = keys;
    }
}
function addShip(_a, roomId) {
    var playerId = _a.playerId, login = _a.login;
    if (!_roomBattleMap.has(roomId)) {
        _roomBattleMap.set(roomId, {
            id: roomId,
            players: new Map(),
            asteroids: [],
            explosions: []
        });
    }
    _roomBattleMap.get(roomId).players.set(playerId, {
        id: playerId,
        login: login,
        ship: new entities_1.Ship({ playerId: playerId }),
        keys: {
            left: 0,
            right: 0,
            up: 0,
            space: 0
        },
        score: 0,
        bullets: []
    });
}
function removeShip(playerId, roomId) {
    if (!_roomBattleMap.has(roomId))
        return;
    _roomBattleMap.get(roomId).players["delete"](playerId);
    if (_roomBattleMap.get(roomId).players.size === 0) {
        _roomBattleMap["delete"](roomId);
    }
}
