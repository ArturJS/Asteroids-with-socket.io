import React from 'react';

export const inputTextCtrl = ({name, value, placeholder, onFocus, onBlur, onChange, disabled, autoComplete = 'off'}) => {
  return (
    <input
      type="text"
      id={name}
      name={name}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      className="form-control"
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}/>
  );
};
