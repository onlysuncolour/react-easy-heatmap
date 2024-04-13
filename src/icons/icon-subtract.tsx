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
const IconSubtract: FC<Props> = ({
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
        <rect x="3" y="11" width="18" height="2"></rect>
      </svg>
    </span>
  );
};

IconSubtract
  .propTypes = {
  iconClassName: PropTypes.string,
  spin: PropTypes.bool,
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

IconSubtract
  .defaultProps = {
  spin: false,
  color: 'currentColor',
  size: '1em'
};

export default IconSubtract;
