import React, { FC } from 'react';

import RcCheckbox from 'rc-checkbox';

import { Theme_Rates } from '../../constants';

import './index.less';
import { toPercent } from '../../../utils';

type ThemeRadioPropsType = {
  label: string[];
  checked: boolean
  onChange: () => void
};

const ThemeRadio: FC<ThemeRadioPropsType> = ({ label, checked, onChange }) => {
  const labelLen = label.length;
  let linerGradient = label.reduce((result, color, index) => {
    result += `${color} ${toPercent(Theme_Rates[index])}`;
    if (index < labelLen - 1) {
      result += ',';
    }
    return result;
  }, '');

  return (
    <label>
      <RcCheckbox checked={checked}
      onChange={onChange}
      >
      </RcCheckbox>
      <div
        className="theme"
        style={{
          background: `linear-gradient(270deg, ${linerGradient})`,
        }}
      ></div>
    </label>
  );
};

export default ThemeRadio;
