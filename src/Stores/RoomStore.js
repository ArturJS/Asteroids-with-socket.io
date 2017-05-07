import {observable, action} from 'mobx';

class RoomStore {
  @observable rooms = [];
  @observable currentRoom = {};

  @action addRoom(room) {
    this.rooms.push(room);
  }

  @action replaceRooms(rooms) {
    this.rooms.replace(rooms);
  }

  @action deleteRoomById(roomId) {
    let room = this.rooms.find((r) => r.id === roomId);

    if (!room) return;

    this.rooms.remove(room);
  }
}

export default new RoomStore();
