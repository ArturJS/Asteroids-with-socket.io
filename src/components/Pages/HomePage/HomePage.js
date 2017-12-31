import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {hashHistory} from 'react-router';
import LoginModal from '../../Common/Modals/LoginModal';
import roomApi from '../../../api/roomApi';
import CreateRoomForm from './CreateRoomForm';
import BattleFieldAutoplay from './BattleFieldAutoplay';
import './HomePage.scss';

@inject('roomStore', 'userStore', 'modalStore')
@observer
export default class HomePage extends Component {
  async componentDidMount() {
    this.props.roomStore.replaceRooms(await roomApi.getRooms());
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

  onDeleteRoom = (event, roomId) => {
    event.preventDefault();
    event.stopPropagation();

    roomApi
      .deleteRoomById(roomId)
      .then(() => {
        this.props.roomStore.deleteRoomById(roomId);
      });
  };

  canDelete = (room) => {
    let {userId} = this.props.userStore.getUserData();

    return room.userId === userId;
  };

  onRoomClick = (e) => {
    const {roomId} = e.target.closest('[data-room-id]').dataset;

    this.goToRoom(roomId);
  };

  onRoomEnter = ({nativeEvent: e}) => {
    const enterKeyCode = 13;

    if (e.keyCode !== enterKeyCode) {
      return;
    }

    this.onRoomClick(e);
  };

  render() {
    const {rooms} = this.props.roomStore;

    return (
      <div className="home-page">
        <BattleFieldAutoplay />
        <div className="page-content">
          <h2 className="page-title">Battle rooms</h2>
          <CreateRoomForm />
          <ul className="rooms-list list-unstyled">
            {rooms.map(room => (
              <li
                key={room.id}
                className="room-item"
                tabIndex="0"
                data-room-id={room.id}
                onKeyDown={this.onRoomEnter}
                onClick={this.onRoomClick}>
                <span className="room-name" title={room.name}>
                  {room.name}
                </span>
                {this.canDelete(room) &&
                <i className="fa fa-times room-delete" onClick={(event) => this.onDeleteRoom(event, room.id)}/>
                }
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
