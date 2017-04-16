import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {Link} from 'react-router';
import homeApi from '../../../api/homeApi';
import CreateRoomForm from './CreateRoomForm';
import LoginModal from '../../Common/Modals/LoginModal';
import './HomePage.scss';

@inject('roomStore', 'modalStore', 'userStore')
@observer
export default class HomePage extends Component {
  async componentDidMount() {
    this.props.roomStore.replaceRooms(await homeApi.getRooms());

    if (!this.props.userStore.isLoggedIn) {
      this.props.modalStore.showCustom('Login', <LoginModal/>);
    }
  }

  render() {
    const {rooms} = this.props.roomStore;

    return (
      <div className="home-page">
        <div className="page-content">
          <h2 className="page-title">Battle rooms</h2>
          <CreateRoomForm />
          <ul className="rooms-list list-unstyled">
            {rooms.map(room => (
              <li key={room.id} className="room-item">
                <Link to={`room/${room.id}`} className="unstyled-link room-item-link">
                  {room.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
