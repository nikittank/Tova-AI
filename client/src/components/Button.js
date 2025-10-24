import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  size = 'medium',
  style = {},
  ...props 
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      fontSize: '0.875rem',
      padding: '0.6em 1.5em'
    },
    medium: {
      fontSize: '1rem',
      padding: '0.8em 2em'
    },
    large: {
      fontSize: '1.25rem',
      padding: '1em 2.5em'
    }
  };

  const config = sizeConfig[size];

  // Base styles for all buttons
  const baseStyles = {
    backgroundColor: 'transparent',
    border: '3px solid #000',
    borderRadius: '1em',
    color: '#000',
    fontWeight: 'bolder',
    transition: 'cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.4s',
    boxShadow: '-5px 5px 0px 0px #000',
    cursor: 'pointer',
    fontSize: config.fontSize,
    padding: config.padding,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    outline: 'none'
  };

  // Variant styles
  const variantStyles = {
    primary: {
      ...baseStyles
    },
    secondary: {
      ...baseStyles,
      border: '3px solid #666',
      boxShadow: '-5px 5px 0px 0px #666',
      color: '#666'
    },
    accent: {
      ...baseStyles,
      border: '3px solid #7c3aed',
      boxShadow: '-5px 5px 0px 0px #7c3aed',
      color: '#7c3aed'
    }
  };

  // Merge variant styles with custom styles
  const finalStyles = {
    ...variantStyles[variant],
    ...style
  };

  const handleMouseEnter = (e) => {
    e.target.style.transform = 'translate(5px, -5px)';
  };

  const handleMouseLeave = (e) => {
    e.target.style.transform = 'translate(0px, 0px)';
  };

  return (
    <button
      onClick={onClick}
      className={`custom-button ${className}`}
      style={finalStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;