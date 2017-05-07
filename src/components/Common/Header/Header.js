import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {Link, browserHistory} from 'react-router';
import UserAuthState from '../UserAuthState';
import './Header.scss';

@inject('roomStore')
@observer
export default class Header extends Component {
  state = {
    isRoomPage: false
  };

  componentDidMount() {
    this.unlisten = browserHistory.listen(this.updateActiveStep);
    this.updateActiveStep();
  }

  componentWillUnmount() {
    this.unlisten();
  }

  updateActiveStep = () => {
    this.setState({
      isRoomPage: /room/.test(browserHistory.getCurrentLocation().hash)
    });
  };

  render() {
    const {isRoomPage} = this.state;
    const {currentRoom} = this.props.roomStore;

    return (
      <nav className="header navbar navbar-default navbar-fixed-top">
        <div className="navbar-header">
          {isRoomPage &&
          <Link className="navbar-brand" to="/">
            <i className="fa fa-arrow-left"/>
            <span className="navbar-brand__text">
              Back to home
            </span>
          </Link>
          }
          {isRoomPage &&
            <div className="room-name">
              Room: {currentRoom.name}
            </div>
          }
          <UserAuthState/>
        </div>
      </nav>
    );
  }
}
