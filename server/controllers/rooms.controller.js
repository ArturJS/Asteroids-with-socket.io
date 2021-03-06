const _ = require('lodash');
const roomsStorage = require('../storages/rooms.storage');
const authDecorator = require('../utils/auth.decorator');

module.exports = {
	getRooms,
	getRoomById,
  createRoom: authDecorator(createRoom),
  deleteRoomById: authDecorator(deleteRoomById)
};

///

function getRooms(req, res) {
  res.status(200).json(
    roomsStorage.getRooms()
      .map(room => _.pick(room, ['id', 'name', 'userId']))
  );
}

function getRoomById(req, res) {
  let {roomId} = req.params;
  let room = roomsStorage.getRoomById(roomId);

  if (!room) {
    res.status(404).json({
      errors: [
        `No data available by roomId="${roomId}"`
      ]
    });
    return;
  }

  res.status(200).json(room);
}

function createRoom(req, res) {
  let {roomName} = req.body;

  if (_.isString(roomName) && roomName.length > 50) {
    res.status(400).json({
      errors: ['Room name shouldn\'t exceed 50 symbols!']
    });
    return;
  }

  let {userId} = req.authData;
  let createdRoom = roomsStorage.createRoom(roomName, userId);

  if (!createdRoom) {
    res.status(400).json({
      errors: ['Room with the same name already exists!']
    });
    return;
  }

  res.status(200).json(createdRoom);
}

function deleteRoomById(req, res) {
  let {roomId} = req.params;
  let {userId} = req.authData;
  let success = roomsStorage.deleteRoom(roomId, userId);

  if (!success) {
    res.status(400).json({
      errors: ['It\'s not your room!']
    });
    return;
  }

  res.status(200).json({roomId});
}
