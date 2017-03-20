import baseApi from './baseApi';

export const homeApi = {
  getRooms() {
    return baseApi.ajax({
      method: 'get',
      url: '/rooms'
    })
      .then(res => {
        return res.data.map(room => {
          return {
            id: room.id,
            name: room.name
          };
        });
      });
  }
};
