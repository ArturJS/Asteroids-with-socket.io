"use strict";
exports.__esModule = true;
var _ = require("lodash");
var rooms_storage_1 = require("../storages/rooms.storage");
var auth_decorator_1 = require("../utils/auth.decorator");
exports["default"] = {
    getRooms: getRooms,
    getRoomById: getRoomById,
    createRoom: auth_decorator_1["default"](createRoom),
    deleteRoomById: auth_decorator_1["default"](deleteRoomById)
};
///
function getRooms(req, res) {
    res.status(200).json(rooms_storage_1["default"].getRooms()
        .map(function (room) { return _.pick(room, ['id', 'name', 'userId']); }));
}
function getRoomById(req, res) {
    var roomId = req.params.roomId;
    var room = rooms_storage_1["default"].getRoomById(roomId);
    if (!room) {
        res.status(404).json({
            errors: [
                "No data available by roomId=\"" + roomId + "\""
            ]
        });
        return;
    }
    res.status(200).json(room);
}
function createRoom(req, res) {
    var roomName = req.body.roomName;
    if (_.isString(roomName) && roomName.length > 50) {
        res.status(400).json({
            errors: ['Room name shouldn\'t exceed 50 symbols!']
        });
        return;
    }
    var userId = req.authData.userId;
    var createdRoom = rooms_storage_1["default"].createRoom(roomName, userId);
    if (!createdRoom) {
        res.status(400).json({
            errors: ['Room with the same name already exists!']
        });
        return;
    }
    res.status(200).json(createdRoom);
}
function deleteRoomById(req, res) {
    var roomId = req.params.roomId;
    var userId = req.authData.userId;
    var success = rooms_storage_1["default"].deleteRoom(roomId, userId);
    if (!success) {
        res.status(400).json({
            errors: ['It\'s not your room!']
        });
        return;
    }
    res.status(200).json({ roomId: roomId });
}
