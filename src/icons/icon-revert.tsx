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
const IconRevert: FC<Props> = ({
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
        <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12h2a8 8 0 101.385-4.5H8v2H2v-6h2V6a9.98 9.98 0 018-4z"></path>
      </svg>
    </span>
  );
};

IconRevert.propTypes = {
  iconClassName: PropTypes.string,
  spin: PropTypes.bool,
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

IconRevert.defaultProps = {
  spin: false,
  color: 'currentColor',
  size: '1em'
};

export default IconRevert;
