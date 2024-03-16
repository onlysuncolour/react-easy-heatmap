import React from 'react'
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from 'react';

import Tooltip from 'rc-tooltip';

import ControlProgress from './components/control-progress';
import Draggable from './components/draggable';
import RcSlider from './components/rc-slider';
import ThemeRadio from './components/theme-radio';
import {
  MAX_OPACITY,
  MAX_RADIUS,
  MAX_SCALE,
  MIN_OPACITY,
  MIN_RADIUS,
  MIN_SCALE,
  THEMES,
} from './constants';
import { ColorCfgPropsType } from './interface';
import { getGradientCfg, getSliderTrackImg } from './utils';

import './index.less';
import { THeatmapLocale } from '..';
import Button from '../button';
import throttle from '../utils/lodash/throttle';

type ClorRangeSliderPropsType = {
  data: ColorCfgPropsType;
  min?: number;
  max?: number;
  step?: number;
  setData: Dispatch<SetStateAction<ColorCfgPropsType>>;
  wrapperDom: HTMLDivElement | null;
  bestValues?: number[];
  scale: number;
  setScale: (v: number) => void;
  colorRange: [number, number];
  setColorRange: (v: any) => void;
  triggerUpdateState?: any;
  localeMap?: THeatmapLocale
};

type TTooltipNodeProps = {
  text: string,
  children?: any
}
const TooltipNode = ({ text, children }: TTooltipNodeProps) => (
  <Tooltip placement="left" overlay={text}>
    {children}
  </Tooltip>
);

type TPopoverLayoutProps = {
  title: string,
  children?: any
}
const PopverLayout = ({ title, children }: TPopoverLayoutProps) => {
  return (
    <div className="popver-item">
      <div className="item-title">{title}</div>
      {children}
    </div>
  );
};

const ColorRangeSlider: FC<ClorRangeSliderPropsType> = ({
  data,
  min,
  max,
  step,
  setData,
  wrapperDom,
  bestValues,
  scale,
  setScale,
  colorRange,
  setColorRange,
  triggerUpdateState,
  localeMap,
}) => {
  const [settingVisible, setSettingVisible] = useState(false);
  const [moving, setMoving] = useState(false);
  const moveRef = useRef<HTMLDivElement>(null);

  const onChange = useCallback(
    throttle((v: number, type: 'opacity' | 'radius' | 'theme') => {
      setData((pre) => {
        pre[type] = v;
        return { ...pre };
      });
    }, 200),
    [],
  );

  const onThemeChange = (v: number) => {
    setData((pre) => {
      pre['theme'] = v;
      return { ...pre };
    });
  };

  const onOpenSettingPopver = () => {
    setSettingVisible((pre) => !pre);
  };

  const onOpenChange = (flag: boolean) => {
    setSettingVisible(flag);
  };

  const popverMenu = (
    <div className="popver--wrapper">
      <PopverLayout title={localeMap?.['不透明度'] || '不透明度'}>
        <ControlProgress
          min={MIN_OPACITY}
          max={MAX_OPACITY}
          unit={'%'}
          onChange={(v) => {
            onChange(v, 'opacity');
          }}
          value={data.opacity || 100}
        />
      </PopverLayout>
      <PopverLayout title={localeMap?.['半径'] || '半径'}>
        <ControlProgress
          min={MIN_RADIUS}
          max={MAX_RADIUS}
          onChange={(v) => {
            onChange(v, 'radius');
          }}
          value={data.radius || 20}
        />
      </PopverLayout>
      <PopverLayout title={localeMap?.['配色方案'] || '配色方案'}>
        {THEMES.map((theme, index) => (
          <ThemeRadio
            key={index}
            onChange={() => onThemeChange(index)}
            checked={(data.theme || 0) === index}
            label={theme}
          />
        ))}
      </PopverLayout>
    </div>
  );

  return (
    <div
      className={`color-range-slider--wrapper ${moving && 'color-range-slider--wrapper-moving'}`}
      ref={moveRef}
    >
      <Draggable
        wrapperDom={wrapperDom as HTMLDivElement}
        moveDom={moveRef.current as HTMLDivElement}
        onMovingStart={() => setMoving(true)}
        onMovingEnd={() => setMoving(false)}
        triggerUpdateState={triggerUpdateState}
      />
      <div className="operation--wrapper">
        <TooltipNode text={localeMap?.['还原'] || '还原'}>
          <Button
            onClick={() => {
              setScale(1);
              setColorRange([0, 1]);
            }}
            // type="text"
            // size="small"
            disabled={scale === 1}
          // icon={<TaRevert />}
          >revert</Button>
        </TooltipNode>

        <TooltipNode text={localeMap?.['放大'] || '放大'}>
          <Button
            disabled={scale === MAX_SCALE}
            onClick={() => {
              setScale(scale + 1);
            }}
          // type="text"
          // size="small"
          // icon={<TaAdd1 />}
          >zoom out</Button>
        </TooltipNode>
        <TooltipNode text={localeMap?.['缩小'] || '缩小'}>
          <Button
            disabled={scale === MIN_SCALE}
            onClick={() => {
              setScale(scale - 1);
            }}
          // type="text"
          // size="small"
          // icon={<TaSubtract />}
          >zoom in</Button>
        </TooltipNode>
        <TooltipNode text={localeMap?.['设置'] || '设置'}>
          <Tooltip
            // @ts-ignore
            className="color-range-slider-setting-popver"
            open={settingVisible}
            onOpenChange={onOpenChange}
            trigger={'click'}
            content={popverMenu}
            placement="leftTop"
            mouseEnterDelay={0.1}
            mouseLeaveDelay={0.1}
            showArrow={false}
          >
            <Button
              // type="text"
              onClick={onOpenSettingPopver}
            // size="small"
            // icon={<TaSetting />}
            >setting</Button>
          </Tooltip>
        </TooltipNode>
      </div>
      <div className="slider--wrapper">
        <RcSlider
          className="custom-range-slider--wrapper"
          range
          vertical
          value={colorRange}
          onChange={(v) => {
            setColorRange(v);
          }}
          min={min || 0}
          max={max || 1}
          step={step || 0.01}
          bestValues={bestValues}
          railImg={getSliderTrackImg(getGradientCfg(data.theme || 0))}
          railStyle={{
            zIndex: 1,
            right: 1,
            width: '12px',
          }}
          handleStyle={{
            zIndex: 2,
            opacity: 1,
            backgroundColor: '#fff',
            borderColor: '#b9becf80',
          }}
        />
      </div>
    </div>
  );
};

export default ColorRangeSlider;