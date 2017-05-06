const config = {
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:3333/api/'
    : '/api/' // todo heroku path
};

export default config;
