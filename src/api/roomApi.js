import baseApi from './baseApi';

const roomApi = {
  getRooms() {
    return baseApi.ajax({
      method: 'get',
      url: '/rooms'
    })
      .then(res => {
        return res.data.map(room => {
          return {
            id: room.id,
            name: room.name,
            userId: room.userId
          };
        });
      });
  },

  getRoomById(roomId) {
    return baseApi.ajax({
      method: 'get',
      url: `/room/${roomId}`
    })
      .then(res => res.data)
      .then(data => ({
        id: data.id,
        name: data.name,
        userId: data.userId
      }));
  },

  createRoom(roomName) {
    return baseApi.ajax({
      method: 'post',
      url: '/room',
      data: {
        roomName
      }
    })
      .then(res => res.data)
      .then(data => ({
        id: data.id,
        name: data.name,
        userId: data.userId
      }));
  },

  deleteRoomById(roomId) {
    return baseApi.ajax({
      method: 'delete',
      url: `/room/${roomId}`
    })
      .then(res => res.data)
      .then(data => ({
        roomId: data.roomId
      }));
  }
};

export default roomApi;
