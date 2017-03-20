import React, {Component} from 'react';
import {Link} from 'react-router';
import {homeApi} from '../../../api/homeApi';
import './HomePage.scss';

export default class HomePage extends Component {
  state = {
    rooms: []
  };

  componentDidMount() {
    homeApi.getRooms()
      .then(rooms => this.setState({rooms}));
  }

  render() {
    const {rooms} = this.state;


    return (
      <div className="home-page">
        <h2 className="page-title">Battle rooms</h2>
        <ul className="rooms-list list-unstyled">
          {rooms.map(room => (
            <li key={room.id} className="room-item">
              <Link to={`room/${room.id}`} className="unstyled-link room-item-link">{room.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
