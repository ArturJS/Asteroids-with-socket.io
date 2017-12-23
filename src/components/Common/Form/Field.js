import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import classNames from 'classnames';

@observer
export default class Field extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    control: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    hideError: PropTypes.bool,
    className: PropTypes.string
  };

  static contextTypes = {
    store: PropTypes.object
  };

  getCtrl() {
    return this.context.store.ctrls[this.props.name];
  }

  onChange = (e) => {
    let ctrl = this.getCtrl();
    let value = e;

    // if standard form inputs
    let target = e.target;
    if (target) {
      value = target.type === 'checkbox' ? target.checked : target.value;
    }

    ctrl.value = ctrl.transform(value, ctrl.value, ctrl);
    this.context.store.validateCtrl(this.props.name);
    ctrl.onChanged(ctrl, this.context.store.ctrls);
  };

  onBlur = () => {
    let ctrl = this.getCtrl();
    ctrl.touched = true;
    this.context.store.validateCtrl(this.props.name);
    ctrl.value = ctrl.onBlurTransform(ctrl.value, ctrl);
    if (ctrl.asyncValidators.length) {
      this.context.store.asyncValidateCtrl(this.props.name);
    }
    ctrl.onBlured(ctrl, this.context.store.ctrls);
  };

  onFocus = () => {
    let ctrl = this.getCtrl();
    ctrl.value = ctrl.onFocusTransform(ctrl.value, ctrl);
  };

  render() {
    let {name, control, placeholder, hideError, className, autoFocus} = this.props;
    let {value, error, touched, options, disabled, maxLength} = this.getCtrl();

    let controlEl = control({
      name,
      value,
      placeholder,
      options,
      disabled,
      maxLength,
      autoFocus,
      touched,
      error,
      onChange: this.onChange,
      onBlur: this.onBlur,
      onFocus: this.onFocus
    });

    return (
      <div className={classNames('field', {[className]: !!className, 'field-error': error})}>
        {controlEl}
        {(!hideError && error) &&
        <small className="field-error-text form-text text-muted">{error}</small>
        }
      </div>
    );
  }
}
