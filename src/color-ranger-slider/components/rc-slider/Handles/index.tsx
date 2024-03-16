// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import * as React from 'react';

import type { OnStartMove } from '../interface';
import { getIndex } from '../util';

import Handle from './Handle';
import type { HandleProps } from './Handle';

export interface HandlesProps {
  prefixCls: string;
  style?: React.CSSProperties | React.CSSProperties[];
  values: number[];
  onStartMove: OnStartMove;
  onOffsetChange: (value: number | 'min' | 'max', valueIndex: number) => void;
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  handleRender?: HandleProps['render'];
  draggingIndex: number;
  bestValues?: number[];
}

export interface HandlesRef {
  focus: (index: number) => void;
}

const Handles = React.forwardRef((props: HandlesProps, ref: React.Ref<HandlesRef>) => {
  const {
    prefixCls,
    style,
    onStartMove,
    onOffsetChange,
    values,
    handleRender,
    draggingIndex,
    bestValues,
    ...restProps
  } = props;
  const handlesRef = React.useRef<Record<number, HTMLDivElement>>({});

  React.useImperativeHandle(ref, () => ({
    focus: (index: number) => {
      handlesRef.current[index]?.focus();
    },
  }));

  return (
    <>
      {values.map((value, index) => (
        <Handle
          ref={(node) => {
            if (!node) {
              delete handlesRef.current[index];
            } else {
              handlesRef.current[index] = node;
            }
          }}
          tooltip={!!bestValues && !!bestValues[index] ? `${bestValues[index] || '...'}` : null}
          dragging={draggingIndex === index}
          prefixCls={prefixCls}
          style={getIndex(style, index)}
          key={index}
          value={value}
          valueIndex={index}
          onStartMove={onStartMove}
          onOffsetChange={onOffsetChange}
          render={handleRender}
          {...restProps}
        />
      ))}
    </>
  );
});

if (process.env.NODE_ENV !== 'production') {
  Handles.displayName = 'Handles';
}

export default Handles;
