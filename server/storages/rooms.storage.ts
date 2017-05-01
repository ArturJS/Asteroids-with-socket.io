import * as shortid from 'shortid';
import * as _ from 'lodash';

export default {
  getRooms: getRooms,
  getRoomById: getRoomById,
  createRoom: createRoom
};

let rooms = [
  {
    id: shortid.generate(),
    name: 'room1'
  },
  {
    id: shortid.generate(),
    name: 'room2'
  },
  {
    id: shortid.generate(),
    name: 'room3'
  }
];

function getRooms() {
  return _.cloneDeep(rooms);
}

function getRoomById(roomId) {
  return _.cloneDeep(
    rooms.find(room => room.id === roomId)
  );
}

function createRoom(roomName) {
  let room = rooms.find(room => room.name === roomName);

  if (room) return null; // room with the same name already exists

  const newRoom = {
    id: shortid.generate(),
    name: roomName
  };

  rooms.push(newRoom);

  return _.clone(newRoom);
}

