import {observable, action} from 'mobx';

class RoomStore {
  @observable rooms = [];

  @action addRoom(room) {
    this.rooms.push(room);
  }

  @action replaceRooms(rooms) {
    this.rooms.replace(rooms);
  }
}

export default new RoomStore();
