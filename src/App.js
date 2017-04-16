import React from 'react';
import {Router, Route, IndexRedirect, hashHistory, Redirect} from 'react-router';
import {Provider} from 'mobx-react';
import 'normalize.css';
import './App.scss';

// Pages
import Shell from './components/Shell';
import HomePage from './components/Pages/HomePage/HomePage';
import RoomPage from './components/Pages/RoomPage/RoomPage';

// Routes
const routes = (
  <Route path="/" component={Shell}>
    <IndexRedirect to="/home"/>
    <Route path="/home" component={HomePage}/>
    <Route path="/room/:roomId" component={RoomPage}/>
    <Redirect from="*" to="/home"/>
  </Route>
);

import {
  roomStore,
  userStore
} from './Stores';
import {modalStore} from './components/Common/ModalDialog';

const stores = {
  roomStore,
  userStore,
  modalStore
};

const App = () => {
  return (
    <Provider {...stores}>
      <Router history={hashHistory} routes={routes}/>
    </Provider>
  );
};

export default App;
