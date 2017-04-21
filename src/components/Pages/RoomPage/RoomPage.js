import React, {Component} from 'react';
import {inject} from 'mobx-react';
import io from 'socket.io-client';
import roomApi from '../../../api/roomApi';
import BattleField from './BattleField';
import './RoomPage.scss';

@inject('userStore')
export default class RoomPage extends Component {
  state = {
    room: {},
    isConnected: false
  };

  componentWillMount() {
    const {authToken} = this.props.userStore.getUserData();

    this.socket = io('http://localhost:3333', {
      'query': `token=${authToken}`
    });
  }

  componentDidMount() {
    roomApi.getRoomById(this.props.params.roomId)
      .then(room => this.setState({room}));

    this.socket.on('connect', () => {
      this.setState({isConnected: true});
    });
  }

  render() {
    const {isConnected, room} = this.state;

    return (
      <div className="room-page">
        <h2 className="page-title">{room.name}</h2>
        {isConnected && <b>Connected</b>}
        <BattleField socket={this.socket} />
      </div>
    );
  }
}
