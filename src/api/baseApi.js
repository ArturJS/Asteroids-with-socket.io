import _ from 'lodash';
import axios from 'axios';

import config from './apiConfig';
import {userStore} from '../Stores';
import {modalStore} from '../components/Common/ModalDialog';


const baseApi = {
  async ajax(request) {
    try {
      const res = await axios({...config, ...request});
      return res;
    }
    catch (error) {
      if (_.get(error, 'response.status') === 401) {
        userStore.resetUserData();
        modalStore.showSignIn();
      }

      console.error(error);
      throw error;
    }
  }
};

export default baseApi;
