import React, {Component} from 'react';
import ModalDialog from './Common/ModalDialog';
import Header from './Common/Header';

export default class Shell extends Component {
  render() {
    return (
      <div className="App">
        <Header/>
        <div className="page container">
          {this.props.children}
        </div>
        <ModalDialog/>
      </div>
    );
  }
}
