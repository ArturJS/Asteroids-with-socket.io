import baseApi from './baseApi';

const roomApi = {
  getRoomById(roomId) {
    return baseApi.ajax({
      method: 'get',
      url: `/room/${roomId}`
    })
      .then(res => res.data)
      .then(data => ({
        ...data // todo fix
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
        name: data.name
      }));
  }
};

export default roomApi;
