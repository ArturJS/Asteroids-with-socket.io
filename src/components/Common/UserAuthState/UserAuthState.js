import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {hashHistory} from 'react-router';
import {inject, observer} from 'mobx-react';
import loginApi from '../../../api/loginApi';
import './UserAuthState.scss';

@inject('modalStore', 'userStore')
@observer
export default class UserAuthState extends Component {
  static propTypes = {
    modalStore: PropTypes.object.isRequired,
    userStore: PropTypes.object.isRequired
  };

  login = () => {
    this.props.modalStore.showSignIn();
  };

  logout = () => {
    loginApi.doSignOut()
      .then(() => {
        hashHistory.push('/');
      });
  };

  render() {
    const {userStore} = this.props;
    const {isLoggedIn} = userStore;
    const {login} = userStore.getUserData();

    return (
      <nav className="user-auth-state">
        {isLoggedIn &&
        <div className="nickname">{login}</div>
        }
        {isLoggedIn &&
        <button
          type="button"
          className="btn btn-link"
          onClick={this.logout}>
          Sign Out
        </button>
        }

        {!isLoggedIn &&
        <button
          type="button"
          className="btn btn-link"
          onClick={this.login}>
          Sign In
        </button>
        }
      </nav>
    );
  }
}
