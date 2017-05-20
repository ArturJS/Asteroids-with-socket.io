import React from 'react';

export const inputTextCtrl = ({
  name,
  value,
  placeholder,
  onFocus,
  onBlur,
  onChange,
  disabled,
  autoFocus,
  autoComplete = 'off',
  maxLength
}) => {
  return (
    <input
      type="text"
      id={name}
      name={name}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      maxLength={maxLength}
      className="form-control"
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}/>
  );
};
