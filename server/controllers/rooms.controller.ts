import * as _ from 'lodash';
import roomsStorage from '../storages/rooms.storage';
import authDecorator from '../utils/auth.decorator';

export default {
	getRooms,
	getRoomById,
  createRoom: authDecorator(createRoom)
};

///

function getRooms(req, res) {
  res.status(200).json(
    roomsStorage.getRooms()
      .map(room => _.pick(room, ['id', 'name']))
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
  let createdRoom = roomsStorage.createRoom(roomName);

  if (!createdRoom) {
    res.status(400).json({
      errors: ['Room with the same name already exists!']
    });
    return;
  }

  res.status(200).json(createdRoom);
}
