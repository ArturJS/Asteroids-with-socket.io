import React, {Component} from 'react';
import {roomApi} from '../../../api/roomApi';
import BattleField from './BattleField';
import './RoomPage.scss';

export default class RoomPage extends Component {
  state = {
    room: {}
  };

  componentDidMount() {
    roomApi.getRoomById(this.props.params.roomId)
      .then(room => this.setState({room}));
  }

  render() {
    const {room} = this.state;

    return (
      <div className="room-page">
        <h2 className="page-title">Room</h2>
        {room.toString()}
        <BattleField />
      </div>
    );
  }
}
