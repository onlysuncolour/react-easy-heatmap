import * as React from 'react'
import PropTypes from 'prop-types';
import { FC } from 'react';

const loadingCircleStyle =
  '@keyframes loadingCircle { 100% { transform: rotate(360deg) }} ';

type Props = {
  color?: any
  size?: any
  spin?: any
  style?: any
  className?: any
  iconClassName?: any
  [propName: string]: any;
}
const IconAdd: FC<Props> = ({
  color,
  size,
  spin,
  style,
  className,
  iconClassName,
  ...otherProps
}) => {
  return (
    <span
      role="img"
      className={
        className
          ? 'heatmap-icon ' + className
          : 'heatmap-icon'
      }
    >
      <style children={loadingCircleStyle} />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
        {...otherProps}
        className={iconClassName}
        style={{
          ...style,
          ...(spin
            ? {
              animationDuration: '1s',
              animationIterationCount: 'infinite',
              animationName: 'loadingCircle',
              animationTimingFunction: 'linear'
            }
            : {})
        }}
      >
        <path d="M11 11V3h2v8h8v2h-8v8h-2v-8H3v-2h8z"></path>
      </svg>
    </span>
  );
};

IconAdd.propTypes = {
  iconClassName: PropTypes.string,
  spin: PropTypes.bool,
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

IconAdd.defaultProps = {
  spin: false,
  color: 'currentColor',
  size: '1em'
};

export default IconAdd;
