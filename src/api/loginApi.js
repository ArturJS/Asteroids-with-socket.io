import baseApi from './baseApi';
import roomApi from './roomApi';
import {userStore, roomStore} from '../Stores';

const loginApi = {
  doSignIn(login) {
    return baseApi.ajax({
      method: 'post',
      url: '/login',
      data: {
        login
      }
    })
      .then(res => res.data)
      .then(data => {
        userStore.setUserData({
          login: data.login,
          authToken: data.token,
          userId: data.userId
        });

        return data;
      });
  },

  doSignOut() {
    return baseApi.ajax({
      method: 'post',
      url: '/logout'
    })
      .then(() => {
        userStore.resetUserData();

        roomApi
          .getRooms()
          .then(rooms => {
            roomStore.replaceRooms(rooms);
          });
      });
  }
};

export default loginApi;
