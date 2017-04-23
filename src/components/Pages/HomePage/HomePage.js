import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {hashHistory} from 'react-router';
import LoginModal from '../../Common/Modals/LoginModal';
import homeApi from '../../../api/homeApi';
import CreateRoomForm from './CreateRoomForm';
import './HomePage.scss';

@inject('roomStore', 'userStore', 'modalStore')
@observer
export default class HomePage extends Component {
  async componentDidMount() {
    this.props.roomStore.replaceRooms(await homeApi.getRooms());
  }

  goToRoom = (roomId) => {
    if (this.props.userStore.isLoggedIn) {
      hashHistory.push(`room/${roomId}`);
      return;
    }

    this.props.modalStore.showCustom('Sign In', <LoginModal/>)
      .then(loggedIn => {
        if (!loggedIn) return;
        hashHistory.push(`room/${roomId}`);
      });
  };

  render() {
    const {rooms} = this.props.roomStore;

    return (
      <div className="home-page">
        <div className="page-content">
          <h2 className="page-title">Battle rooms</h2>
          <CreateRoomForm />
          <ul className="rooms-list list-unstyled">
            {rooms.map(room => (
              <li key={room.id} className="room-item" onClick={() => this.goToRoom(room.id)}>
                {room.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
