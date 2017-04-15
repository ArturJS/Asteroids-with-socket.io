import baseApi from './baseApi';

const homeApi = {
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

export default homeApi;
