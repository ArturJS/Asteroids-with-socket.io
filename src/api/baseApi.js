import axios from 'axios';
import config from './apiConfig';

const baseApi = {
  ajax(request) {
    let promise = axios({...config, ...request});

    promise
      .then(res => res)
      .catch((error) => {
        console.warn(error);
      });

    return promise;
  }
};

export default baseApi;
