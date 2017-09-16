"use strict";
exports.__esModule = true;
var shortid = require("shortid");
var _ = require("lodash");
exports["default"] = {
    getRooms: getRooms,
    getRoomById: getRoomById,
    createRoom: createRoom,
    getRoomIdsByUserId: getRoomIdsByUserId,
    deleteRoom: deleteRoom,
    deleteRoomsByUserId: deleteRoomsByUserId
};
var rooms = [];
function getRooms() {
    return _.cloneDeep(rooms);
}
function getRoomById(roomId) {
    return _.cloneDeep(rooms.find(function (room) { return room.id === roomId; }));
}
function getRoomIdsByUserId(userId) {
    return rooms
        .filter(function (room) { return room.userId = userId; })
        .map(function (room) { return room.id; });
}
function createRoom(roomName, userId) {
    var room = rooms.find(function (room) { return room.name === roomName; });
    if (room)
        return null; // room with the same name already exists
    var newRoom = {
        id: shortid.generate(),
        name: roomName,
        userId: userId
    };
    rooms.push(newRoom);
    return _.clone(newRoom);
}
function deleteRoom(roomId, userId) {
    var room = rooms.find(function (room) { return room.id === roomId; });
    if (!room || room.userId !== userId)
        return false; // if it's not your room
    _.remove(rooms, function (room) { return room.id === roomId; });
    return true;
}
function deleteRoomsByUserId(userId) {
    _.remove(rooms, function (room) { return room.userId === userId; });
}
