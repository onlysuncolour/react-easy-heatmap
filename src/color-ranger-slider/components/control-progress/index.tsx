import { FC } from 'react';

import Slider from '../rc-slider'
import InputNumber from 'rc-input-number'
import React from 'react';

type ControlProgressPropsItem = {
  min: number;
  max: number;
  unit?: string;
  value: number;
  onChange: (v: number) => void;
};
const ControlProgress: FC<ControlProgressPropsItem> = ({
  min,
  max,
  unit,
  value,
  onChange,
}) => {
  return (
    <div className="progress--wrapper">
      <Slider
        className="custom-slider--wrapper"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        step={1}
      />
      <InputNumber
        min={min}
        max={max}
        style={{ width: '56px' }}
        value={value}
        onChange={onChange}
      />
      {unit && <span className="unit">{unit}</span>}
    </div>
  );
};

export default ControlProgress;
