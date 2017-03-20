import baseApi from './baseApi';

export const roomApi = {
  getRoomById(roomId) {
    return baseApi.ajax({
      method: 'get',
      url: `/room/${roomId}`
    })
      .then(res => res.data)
      .then(data => ({
        ...data // todo fix
      }));
  }
};
