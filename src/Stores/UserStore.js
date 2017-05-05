import {
  action,
  extendObservable,
  observable
} from 'mobx';
import axios from 'axios';

const USER_DATA_KEY = 'userData';

class UserStore {
  @observable userData = {
    login: null,
    authToken: null,
    userId: null
  };

  constructor() {
    let userData = localStorage.getItem(USER_DATA_KEY);

    if (userData) {
      this.setUserData(JSON.parse(userData));
    }
  }

  @action
  setUserData(data) {
    extendObservable(this.userData, data);

    if (data.authToken) {
      axios.defaults.headers.common.Authorization = data.authToken;
    }

    localStorage.setItem(USER_DATA_KEY, JSON.stringify(this.userData));
  }

  getUserData() {
    return this.userData;
  }

  @action
  resetUserData() {
    this.userData = {
      login: null,
      authToken: null,
      userId: null
    };

    axios.defaults.headers.common.Authorization = null;
    localStorage.removeItem(USER_DATA_KEY);
  }

  get isLoggedIn() {
    return !!this.userData.authToken;
  }
}

export default new UserStore();
