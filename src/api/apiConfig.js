const config = {
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:3333/api/' : '/api/',
  baseSocketURL: process.env.NODE_ENV === 'development' ? 'http://localhost:3333/' : '/'
};

export default config;
