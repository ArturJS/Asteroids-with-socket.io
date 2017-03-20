import React, {Component} from 'react';

export default class Shell extends Component {
  render() {
    return (
      <div className="App">
        <div className="page container">
          {this.props.children}
        </div>
      </div>
    );
  }
}
