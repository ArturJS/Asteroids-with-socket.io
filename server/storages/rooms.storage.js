// @flow
const shortid = require('shortid');
const _ = require('lodash');

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  getRoomIdsByUserId,
  deleteRoom,
  deleteRoomsByUserId
};

let rooms = [];

function getRooms() {
  return _.cloneDeep(rooms);
}

function getRoomById(roomId: string) {
  return _.cloneDeep(
    rooms.find(room => room.id === roomId)
  );
}

function getRoomIdsByUserId(userId: string) {
  return rooms
    .filter((room) => room.userId = userId)
    .map((room) => room.id);
}

function createRoom(roomName: string, userId: string) {
  let room = rooms.find(room => room.name === roomName);

  if (room) return null; // room with the same name already exists

  const newRoom = {
    id: shortid.generate(),
    name: roomName,
    userId
  };

  rooms.push(newRoom);

  return _.clone(newRoom);
}

function deleteRoom(roomId: string, userId: string) {
  let room = rooms.find(room => room.id === roomId);

  if (!room || room.userId !== userId) return false; // if it's not your room

  _.remove(rooms, (room) => room.id === roomId);

  return true;
}

function deleteRoomsByUserId(userId: string) {
  _.remove(rooms, (room) => room.userId === userId);
}

