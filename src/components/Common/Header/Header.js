import React, {Component} from 'react';
import {Link, browserHistory} from 'react-router';
import UserAuthState from '../UserAuthState';
import './Header.scss';

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
          <UserAuthState/>
        </div>
      </nav>
    );
  }
}
