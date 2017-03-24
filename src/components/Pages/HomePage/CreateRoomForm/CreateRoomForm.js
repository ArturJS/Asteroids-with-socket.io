import React, {Component} from 'react';
import {inject} from 'mobx-react';
import {Form, Field, Controls, FormStore} from '../../../Common/Form';
import ErrorSummary from '../../../Common/ErrorSummary';
import {roomApi} from '../../../../api/roomApi';
import './CreateRoomForm.scss';

@inject('roomStore')
export default class CreateRoomForm extends Component {
  state = {
    errors: null
  };

  componentWillMount() {
    this.formStore = new FormStore({
      roomName: {
        value: ''
      }
    });
  }

  onSubmit = (async(e) => {
    e.preventDefault();

    const values = this.formStore.getValues();

    try {
      const createdRoom = await roomApi.createRoom(values.roomName);
      this.props.roomStore.addRoom(createdRoom);
      this.formStore.reset();
      this.setState({errors: null});
    }
    catch (err) {
      console.dir(err);
      if (err.response && err.response.status === 400) {
        this.setState({
          errors: err.response.data.errors
        });
      }
    }
  });

  render() {
    const {inputTextCtrl} = Controls;
    const {errors} = this.state;

    return (
      <Form
        store={this.formStore}
        onSubmit={this.onSubmit}
        className="create-room-form">
        <h4 className="page-title">Create new room</h4>
        <div className="form-group">
          <label htmlFor="roomName" className="control-label">
            Room name:
          </label>
          <Field
            name="roomName"
            control={inputTextCtrl}
            placeholder="Enter room name here..."
            className="form-control"/>
        </div>
        <ErrorSummary errors={errors}/>
      </Form>
    );
  }
}
