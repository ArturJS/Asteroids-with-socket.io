import React from 'react';

export const inputTextCtrl = ({name, value, placeholder, onFocus, error, onChange, onBlur, disabled}) => {
  return (
    <input
      type="text"
      id={name}
      name={name}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      className="form-control"
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}/>
  );
};
