import React, {Component, PropTypes} from 'react';
import {inject} from 'mobx-react';
import {Form, Field, FormStore, Controls, Validators} from '../../Form';
import loginApi from '../../../../api/loginApi';
import ErrorSummary from '../../ErrorSummary';
import './LoginModal.scss';

@inject('modalStore')
export default class LoginModal extends Component {
  static propTypes = {
    modalStore: PropTypes.object.isRequired
  };

  state = {
    errors: null
  };

  componentWillMount() {
    this.formStore = new FormStore({
      login: {
        value: '',
        validators: [
          Validators.required('Login is required')
        ]
      }
    });
  }

  onSubmit = (event) => {
    event && event.preventDefault();

    let {valid} = this.formStore.validate();
    if (!valid) return;

    const {
      login
    } = this.formStore.getValues();

    loginApi.doSignIn(login)
      .then(() => {
        this.props.modalStore.close(true);
      })
      .catch(error => {
        if (error.response.status === 400) {
          this.setState({
            errors: error.response.data.errors
          });
        }
      });
  };

  render() {
    const {inputTextCtrl} = Controls;
    const {errors} = this.state;

    return (
      <Form
        onSubmit={this.onSubmit}
        store={this.formStore}
        className="login-modal">
        <div className="form">
          <div className="form-group">
            <label
              htmlFor="login"
              className="control-label">Nickname</label>
            <Field
              className="control-field"
              name="login"
              autoFocus={true}
              control={inputTextCtrl}/>
          </div>
          <ErrorSummary errors={errors}/>
        </div>
        <div className="buttons-group">
          <button
            type="submit"
            className="btn btn-primary btn-submit">Submit</button>
        </div>
      </Form>
    );
  }
}
