// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import * as React from 'react';

import SliderContext from '../context';

import Dot from './Dot';

export interface StepsProps {
  prefixCls: string;
  dots?: boolean;
  style?: React.CSSProperties | ((dotValue: number) => React.CSSProperties);
  activeStyle?: React.CSSProperties | ((dotValue: number) => React.CSSProperties);
}

export default function Steps(props: StepsProps) {
  const { prefixCls, dots, style, activeStyle } = props;
  const { min, max, step } = React.useContext(SliderContext);

  const stepDots = React.useMemo(() => {
    const dotSet = new Set<number>();

    // Fill dots
    if (dots && step !== null) {
      let current = min;
      while (current <= max) {
        dotSet.add(current);
        current += step;
      }
    }

    return Array.from(dotSet);
  }, [min, max, step, dots]);

  return (
    <div className={`${prefixCls}-step`}>
      {stepDots.map((dotValue) => (
        <Dot
          prefixCls={prefixCls}
          key={dotValue}
          value={dotValue}
          style={style}
          activeStyle={activeStyle}
        />
      ))}
    </div>
  );
}
