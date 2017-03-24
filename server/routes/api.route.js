const express = require('express');
const router = express.Router();

const pathPrefix = './../controllers/';
const roomsController = require(`${pathPrefix}rooms.controller.js`);

///Rooms
router.get('/rooms', roomsController.getRooms);
router.get('/room/:roomId', roomsController.getRoomById);
router.post('/room', roomsController.createRoom);

module.exports = router;
