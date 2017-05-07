import React, {Component} from 'react';
import {inject} from 'mobx-react';
import io from 'socket.io-client';
import roomApi from '../../../api/roomApi';
import config from '../../../api/apiConfig';
import BattleField from './BattleField';
import './RoomPage.scss';

@inject('userStore', 'roomStore')
export default class RoomPage extends Component {
  componentWillMount() {
    const {authToken} = this.props.userStore.getUserData();
    const {roomId} = this.props.params;

    this.socket = io(config.baseSocketURL, {
      'query': `token=${authToken}&roomId=${roomId}`
    });
  }

  componentDidMount() {
    roomApi.getRoomById(this.props.params.roomId)
      .then(room => this.props.roomStore.currentRoom = room);
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    return (
      <div className="room-page">
        <BattleField socket={this.socket} />
      </div>
    );
  }
}
