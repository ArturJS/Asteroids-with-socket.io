import React, {Component} from 'react';
import {inject} from 'mobx-react';
import io from 'socket.io-client';
import roomApi from '../../../api/roomApi';
import config from '../../../api/apiConfig';
import BattleField from './BattleField';
import './RoomPage.scss';

@inject('userStore')
export default class RoomPage extends Component {
  state = {
    room: {}
  };

  componentWillMount() {
    const {authToken} = this.props.userStore.getUserData();
    const {roomId} = this.props.params;

    this.socket = io(config.baseSocketURL, {
      'query': `token=${authToken}&roomId=${roomId}`
    });
  }

  componentDidMount() {
    roomApi.getRoomById(this.props.params.roomId)
      .then(room => this.setState({room}));
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    const {room} = this.state;

    return (
      <div className="room-page">
        <h2 className="page-title">{room.name}</h2>
        <BattleField socket={this.socket} />
      </div>
    );
  }
}
