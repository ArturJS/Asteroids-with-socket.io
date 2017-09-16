"use strict";
exports.__esModule = true;
var express = require("express");
var rooms_controller_1 = require("./../controllers/rooms.controller");
var login_controller_1 = require("./../controllers/login.controller");
var router = express.Router();
router.post('/login', login_controller_1["default"].doSignIn);
router.post('/logout', login_controller_1["default"].doSignOut);
///Rooms
router.get('/rooms', rooms_controller_1["default"].getRooms);
router.get('/room/:roomId', rooms_controller_1["default"].getRoomById);
router["delete"]('/room/:roomId', rooms_controller_1["default"].deleteRoomById);
router.post('/room', rooms_controller_1["default"].createRoom);
exports["default"] = router;
