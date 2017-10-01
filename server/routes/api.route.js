// @flow
const express = require('express');
const roomsController = require('./../controllers/rooms.controller.js');
const loginController = require('./../controllers/login.controller.js');

const router = express.Router();

router.post('/login', loginController.doSignIn);
router.post('/logout', loginController.doSignOut);

///Rooms
router.get('/rooms', roomsController.getRooms);
router.get('/room/:roomId', roomsController.getRoomById);
router.delete('/room/:roomId', roomsController.deleteRoomById);
router.post('/room', roomsController.createRoom);

module.exports = router;
