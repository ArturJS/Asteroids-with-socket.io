import baseApi from './baseApi';
import {userStore} from '../Stores';

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
          authToken: data.token
        });

        return data;
      });
  },

  doSignOut() {
    return new Promise((res) => {
      res();
    })
      .then(() => {
        userStore.resetUserData();
      });
  }
};

export default loginApi;
