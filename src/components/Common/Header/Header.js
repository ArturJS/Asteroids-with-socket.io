import React, {Component} from 'react';
import {Link} from 'react-router';
import UserAuthState from '../UserAuthState';
import './Header.scss';

export default class Header extends Component {
  render() {
    return (
      <nav className="header navbar navbar-default navbar-fixed-top">
        <div className="navbar-header">
          <Link className="navbar-brand" to="/">
            <div className="logo">
              <div className="logo-sizer"/>
            </div>
          </Link>
          <UserAuthState/>
        </div>
      </nav>
    );
  }
}