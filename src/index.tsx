import * as React from 'react'
import './index.less'
import { useDebounceFn, useLatest } from 'ahooks';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import ColorRangeSlider from './color-ranger-slider';
import { Theme_Rates, THEMES } from './color-ranger-slider/constants';
import { ColorCfgPropsType } from './color-ranger-slider/interface';
import { getGradientCfg } from './color-ranger-slider/utils';

import { handleBackgroundDrag } from './background-drag';
import './heatmap.min.js';

const heatmapEmpty = require('./assets/heatmap-empty.png')

import {
  debounce,
  getDataPos,
  getRealCoordinate,
  getScale0Value,
  getTargetColors,
  getTransData,
  getUnfilledAxis,
  toFloat,
} from './utils';

import getUuid from './utils/getUuid'
import isEmpty from './utils/lodash/isEmpty';
import isEqual from './utils/lodash/isEqual';

type TPoint = {
  x: number;
  y: number;
};

type PointType = {
  x: number;
  y: number;
};

export type THeatmapLocale = {
  不透明度?: string;
  半径?: string;
  配色方案?: string;
  还原?: string;
  放大?: string;
  缩小?: string;
  设置?: string;
}

type Props = {
  data: number[][];
  className?: string;
  mapFile?: {
    image: string;
    imgSize: PointType;
    coordinate: {
      p1: PointType;
      p2: PointType;
    };
  };
  sliderCfg?: ColorCfgPropsType;
  onCfgChange?: (data: ColorCfgPropsType) => void;
  onPostionChange?: (v: any) => void;
  localeMap?: THeatmapLocale
  documentResizeEventKey?: string
};

type RefProps = {
  handleSyncAction: (v: any) => void;
};
const p1Default = { x: -9999, y: -9999 };
const p2Default = { x: 9999, y: 9999 };

// @ts-ignore
const sortFunc = (a: number | string, b: number | string) => (a - b);

const HeatMap = forwardRef<RefProps, Props>(
  (
    {
      data,
      className,
      mapFile,
      sliderCfg,
      onCfgChange,
      onPostionChange,
      localeMap,
      documentResizeEventKey,
    },
    ref,
  ) => {
    // 图片当作背景的位置，默认在中间（等比缩放后刚好在中间，占满 宽高某一处）
    const [backgroundPosition, setBackgroundPosition] = useState({ x: 50, y: 50 });
    // 放大缩小/数据变动/拖拽 之后引起的 loading
    const [loading, setLoading] = useState(false);
    // image在当前container下，不放大缩小的情况下，实际的宽高
    const [scale0Size, setScale0Size] = useState<{
      x: number;
      y: number;
      bgSizePercent: number[];
      xFlag: boolean;
    }>({
      x: 0,
      y: 0,
      bgSizePercent: [1, 1],
      xFlag: false,
    });

    const [triggerUpdateState, setTriggerUpdateState] = useState({});

    const [bestValues, setBestValues] = useState<number[]>([]);

    // 当前是否在移动中
    const [moving, setMoving] = useState(false);
    const movingLatest = useLatest(moving);

    // 未占满的轴
    const [unfilledAxis, setUnfilledAxis] = useState('');
    const unfilledAxisLatest = useLatest(unfilledAxis);

    // 热力图的其他配置
    const [dataCfg, setDataCfg] = useState<ColorCfgPropsType>({
      // opacity: 100,
      // radius: 20,
      // theme: 0,
    });
    const [disableUpdateBgpFlag, setDisableUpdatBgpFlag] = useState(false);

    const backgroundDragRef = useRef({
      unmount: () => {},
      // @ts-ignore
      setNewCenter: (x: number, y: number) => {},
    });

    const [displayRange, setDisplayRange] = useState({
      p1: { x: 0, y: 0 },
      p2: { x: 0, y: 0 },
    });

    const [dataRange, setDataRange] = useState({
      p1: p1Default,
      p2: p2Default,
    });

    const [containerSize, setContainerSize] = useState({ x: 0, y: 0 });
    // const { radius = 20, opacity = 100, scale = 1, theme = 0, colorRange = [0, 1] } = dataCfg;
    const { radius = 20, opacity = 100, theme = 0 } = dataCfg;

    const [scale, setScale] = useState(1);
    const [colorRange, setColorRange] = useState<[number, number]>([0, 1]);

    const _opacity = toFloat(opacity / 100) as number;

    const maximunValRef = useRef<number[][]>([[], [], []]);
    const heatmapRef = useRef<any>();
    const tooltipRef = useRef<HTMLDivElement>(null);
    const uuidRef = useRef(getUuid());
    const timerRef = useRef<NodeJS.Timeout>();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const gradientCfgBakRef = useRef<Record<string, string>>({});

    const scale0SizeLatest = useLatest(scale0Size);
    const backgroundPositionLatest = useLatest(backgroundPosition);
    const scaleLatest = useLatest(scale);
    const displayRangeLatest = useLatest(displayRange);
    const dataRangeLatest = useLatest(dataRange);
    const loadingLatest = useLatest(loading);

    const setHeatmapDataThrottle = useDebounceFn(setHeatmapData, { wait: 120 });

    const heatmapClassName = useMemo(() => {
      return `heatmap-${uuidRef.current}`;
    }, []);

    const formatData = useMemo(() => {
      let xData:any[] = [];
      let yData:any[] = [];
      const result:any[] = [];
      data.forEach(([x, y, v]) => {
        xData.push(x);
        yData.push(y);
        result.push({
          x,
          y,
          value: v,
        });
      });
      xData = xData.sort(sortFunc);
      yData = yData.sort(sortFunc);
      maximunValRef.current = [
        [xData[0], xData[xData.length - 1]],
        [yData[0], yData[yData.length - 1]],
      ];
      return result.sort((a, b) => sortFunc(b.value, a.value));
    }, [data]);

    const { imgSize, image, coordinate } = useMemo(() => {
      if (isEmpty(mapFile) || !mapFile) {
        let [xMin = 0, xMax = 0] = maximunValRef.current?.[0];
        let [yMin = 0, yMax = 0] = maximunValRef.current?.[1];
        if (xMin === xMax) {
          xMin = +xMin - 100;
          xMax = +xMax + 100;
        } else {
          const t = xMax - xMin;
          xMin = +xMin - t * 0.1;
          xMax = +xMax + t * 0.1;
        }
        if (yMin === yMax) {
          yMin = +yMin - 100;
          yMax = +yMax + 100;
        } else {
          const t = yMax - yMin;
          yMin = +yMin - t * 0.1;
          yMax = +yMax + t * 0.1;
        }
        return {
          image: heatmapEmpty,
          coordinate: {
            p1: { x: xMin, y: yMin },
            p2: { x: xMax, y: yMax },
          },
          imgSize: {
            x: 500,
            y: 500,
          },
        };
      }
      return mapFile;
    }, [mapFile]);

    const currentThemeColors = useMemo(() => {
      const colors:string[] = [];
      const currentThemes = THEMES[theme];
      Theme_Rates.forEach((c, index) => {
        const startColor = currentThemes[index];
        const endColor = currentThemes[index + 1];
        if (endColor) {
          const step = toFloat((Theme_Rates[index + 1] - c) * 100, 0);
          colors.push(...getTargetColors(startColor, endColor, Number(step)));
        }
      });

      return colors;
    }, [theme]);

    const backgroundSize = useMemo(() => {
      if (
        scale0Size.x * 2 ** (scale - 1) >= containerSize.x &&
        scale0Size.y * 2 ** (scale - 1) >= containerSize.y
      ) {
        const size = `${2 ** (scale - 1) * 100}%`;
        return `${size}`;
      }
      let getPercent = (v: number) => {
        return v === 0 ? 'auto' : 2 ** (scale - 1) * 100 + '%';
      };
      return `${getPercent(scale0Size.bgSizePercent[0])} ${getPercent(
        scale0Size.bgSizePercent[1],
      )}`;
    }, [scale, scale0Size.bgSizePercent]);

    const dataLatest = useLatest(formatData);
    const colorRangeLatest = useLatest(colorRange);

    useEffect(() => {
      if (onCfgChange && !isEmpty(dataCfg)) {
        onCfgChange(dataCfg);
      }
    }, [dataCfg]);

    useEffect(() => {
      if (onCfgChange) {
        onCfgChange(dataCfg);
      }
    }, [dataCfg]);

    useEffect(() => {
      if (!disableUpdateBgpFlag && onPostionChange) {
        onPostionChange({ bgP: backgroundPositionLatest.current, scale: scaleLatest.current });
      }
    }, [backgroundPosition, scale]);

    // useEffect 1st
    // 生成heatmap 以及 绑定拖拽事件
    useEffect(() => {
      // @ts-ignore
      const heatmap = window.Heatmap.create({
        container: document.getElementById(`heatmapContainer-${uuidRef.current}`),
      });

      heatmapRef.current = heatmap;

      backgroundDragRef.current = handleBackgroundDrag(
        `heatmapContainer-${uuidRef.current}`,
        (x, y) => {
          const newPosition = { x, y };
          if (unfilledAxisLatest.current === 'x') {
            newPosition.x = 50;
          }
          if (unfilledAxisLatest.current === 'y') {
            newPosition.y = 50;
          }
          if (!isEqual(newPosition, backgroundPositionLatest.current)) {
            setBackgroundPosition(newPosition);
          }
        },
        // onMovingStart
        onMovingStart,
        // onMoving
        () => {
          if (!loadingLatest.current) {
            setLoading(true);
            // setMoving(true)
            emptyData();
          }
          onMoving();
        },
        // onMovingEnd
        () => {
          if (movingLatest.current) {
            setMoving(false);
            onMoving();
          }
        },
        scaleLatest,
        movingLatest,
      );

      setTimeout(() => {
        getRange();
      }, 60);

      return () => {
        backgroundDragRef.current.unmount();
        emptyData();
      };
    }, []);

    // useEffect 2nd
    useEffect(() => {
      const gradientCfg = getGradientCfg(theme);
      gradientCfgBakRef.current = gradientCfg;
      heatmapRef.current?.configure?.({
        radius,
        gradient: gradientCfg,
        defaultMaxOpacity: _opacity,
        className: heatmapClassName,
      });
    }, [theme, radius, _opacity, heatmapClassName]);

    useEffect(() => {
      // 调节颜色范围 动态修改gradient
      const defaultGradientCfg = gradientCfgBakRef.current;
      const [start, end] = colorRange;
      const startScale = Theme_Rates[0];
      const startColor = defaultGradientCfg?.[startScale];
      // 计算最新的渐变色配置
      const newThemeRates = getNewThemeRates(start, end);
      const newGragient: any = {};
      newThemeRates.forEach((v) => {
        const sIndex =
          (toFloat(v * 100, 0) as number) - (toFloat(Theme_Rates[0] * 100, 0) as number);
        const color =
          defaultGradientCfg[v] || (v <= startScale ? startColor : currentThemeColors[sIndex]);
        newGragient[v] = color;
      });

      heatmapRef.current?.configure?.({
        gradient: newGragient,
      });
      setHeatmapDataThrottle.run();
    }, [colorRange, currentThemeColors]);

    useEffect(() => {
      setDataRange({
        p1: coordinate?.p1,
        p2: coordinate?.p2,
      });
    }, [coordinate]);

    useEffect(() => {
      let timer:NodeJS.Timeout;
      function handleWindowResize() {
        clearTimeout(timer);
        timer = setTimeout(handleResize, 150);
      }

      function handleResize() {
        setTriggerUpdateState({});
      }

      window.addEventListener('resize', handleWindowResize);
      if (documentResizeEventKey) {
        document.addEventListener(documentResizeEventKey, handleResize)
      }

      return () => {
        window.removeEventListener('resize', handleWindowResize);
        if (documentResizeEventKey) {
          document.removeEventListener(documentResizeEventKey, handleResize)
        }
      };
    }, []);

    useEffect(() => {
      if (!isEmpty(sliderCfg) && !!sliderCfg) {
        setDataCfg(sliderCfg);
      }
    }, [sliderCfg]);

    useEffect(() => {
      setScale0Size(getScale0Value(getContainerSize(), imgSize));
    }, [imgSize]);

    useEffect(() => {
      let newPosition = { ...backgroundPositionLatest.current };
      if (
        !!unfilledAxis &&
        !(unfilledAxis === 'x' && newPosition.x === 50) &&
        !(unfilledAxis === 'y' && newPosition.y === 50)
      ) {
        if (unfilledAxis === 'x') newPosition.x = 50;
        if (unfilledAxis === 'y') newPosition.y = 50;
        setBackgroundPosition(newPosition);
      }
    }, [unfilledAxis]);

    useEffect(() => {
      if (!formatData) {
        return;
      }
      setLoading(true);
      emptyData();
      setHeatmapDataThrottle.run();
    }, [formatData]);

    useEffect(() => {
      setLoading(true);
      if (scale === 1) {
        setBackgroundPosition({ x: 50, y: 50 });
      }
      emptyData();
      setTimeout(() => {
        getRange();
        setHeatmapDataThrottle.run();
      }, 60);
    }, [scale, scale0Size]);

    useImperativeHandle(
      ref,
      () => {
        return {
          handleSyncAction({ scale, bgP }) {
            if (!isEqual(scale, scaleLatest.current)) {
              setScale(scale);
            }
            if (!!bgP && !isEqual(bgP, backgroundPositionLatest.current)) {
              backgroundDragRef.current.setNewCenter(bgP.x, bgP.y);
              setDisableUpdatBgpFlag(true);
              if (!moving) {
                onMovingStart();
              }
              onMoving();
            }
          },
        };
      },
      [],
    );

    const getNewThemeRates = (start: number, end: number) => {
      const coneThemeRates = [...Theme_Rates];
      const s = start < 0.25 ? 0.25 : start;
      const e = end < 0.25 ? 0.25 : end;
      const startIndex = coneThemeRates.findIndex((v) => v >= s);
      // @ts-ignore
      const endIndex = coneThemeRates.findLastIndex((v) => v <= e);
      if (startIndex > -1 && endIndex > -1) {
        const newThemeRate = coneThemeRates.slice(startIndex, endIndex + 1);
        newThemeRate.unshift(s);
        newThemeRate.push(e);

        return Array.from(new Set(newThemeRate));
      }

      return coneThemeRates;
    };

    const updateTooltip = (x: number, y: number, value: number | string, dom: HTMLDivElement | null, vx: number | string, vy: number | string) => {
      if (!!dom) {
        const transl = 'translate(' + (x + 15) + 'px, ' + (y + 15) + 'px)';
        dom.style.cssText = `transform: ${transl}; display: block;`;
        dom.innerHTML = `
        <div class="tooltip-title">${value}</div>
        <div class="tooltip-axis">
          <div class="axis">X: <span>${vx}</span></div>
          <div class="axis">Y: <span>${vy}</span></div>
        </div>
      `;
      }
    };

    useEffect(() => {
      const Wrapper = wrapperRef.current;
      const tooltip = tooltipRef.current;
      const canvasDom = document.getElementsByClassName(heatmapClassName)[0];

      const mousemoveListener = (e: MouseEvent) => {
        if (e.target === canvasDom) {
          let x = e.offsetX;
          let y = e.offsetY;
          const { x: xMin, y: yMin } = displayRangeLatest.current.p1,
            { x: xMax, y: yMax } = displayRangeLatest.current.p2;

          if (!!tooltip && (x < xMin || x > xMax || y < yMin || y > yMax)) {
            tooltip.style.display = 'none';
            return;
          }
          const realCoordinate = getRealCoordinate({
            displayRange: displayRangeLatest.current,
            dataRange: dataRangeLatest.current,
            containerSize: getContainerSize(),
            curPos: { x, y },
          });
          const value = heatmapRef.current?.getValueAt({
            x,
            y,
          });
          if (x + 100 > xMax) {
            x = x - 100 - 15;
          }
          if (y + 100 > yMax) {
            y = y - 100 - 15;
          }
          updateTooltip(x, y, value, tooltip, realCoordinate.x, realCoordinate.y);
        }
      };
      const mouseOutListener = () => {
        if (!!tooltip) {
          tooltip.style.display = 'none';
        }
      };

      (Wrapper as HTMLDivElement)?.addEventListener?.('mousemove', mousemoveListener);
      (Wrapper as HTMLDivElement)?.addEventListener?.('mouseout', mouseOutListener);

      return () => {
        (Wrapper as HTMLDivElement)?.removeEventListener?.('mousemove', mousemoveListener);
        (Wrapper as HTMLDivElement)?.removeEventListener?.('mouseout', mouseOutListener);
      };
    }, []);

    useEffect(() => {
      try {
        if (!!wrapperRef.current) {
          const y = +getComputedStyle(wrapperRef.current).height.replace(/px/, '');
          const x = +getComputedStyle(wrapperRef.current).width.replace(/px/, '');
          if (!isEqual({ y, x }, containerSize)) {
            setContainerSize({ y, x });
            heatmapRef.current?.configure?.({
              height: y,
              width: x,
            });
          }
        }
      } catch (err) {}
    });

    useEffect(() => {
      const _scale0Size = getScale0Value(containerSize, imgSize);
      setScale0Size(_scale0Size);
    }, [containerSize]);

    function onMovingStart() {
      setMoving(true);
      // setLoading(true);
      // emptyData();
    }

    function onMovingEnd() {
      getRange();
      setHeatmapDataThrottle.run();
      setDisableUpdatBgpFlag(false);
    }

    function getContainerSize() {
      return {
        x: document.getElementById(`heatmapContainer-${uuidRef.current}`)?.offsetWidth || 0,
        y: document.getElementById(`heatmapContainer-${uuidRef.current}`)?.offsetHeight || 0,
      };
    }

    const onMoving = debounce(onMovingEnd, 500);

    function getRange() {
      const container = getContainerSize();
      const scale0SizeCurrentValue =
        scale0SizeLatest.current.x === 0
          ? getScale0Value(container, imgSize)
          : scale0SizeLatest.current;
      const unfillLineResult = getUnfilledAxis(
        scaleLatest.current,
        container,
        scale0SizeCurrentValue,
        scale0SizeCurrentValue.xFlag,
      );

      const xFlag = scale0SizeCurrentValue.xFlag;

      setUnfilledAxis(unfillLineResult ? (xFlag ? 'x' : 'y') : '');

      if (scaleLatest.current === 1) {
        if (!unfillLineResult) {
          return;
        }
        // unfilledLength 即为 没有占满的 那条边
        const { unfilledLength } = unfillLineResult;

        let p1: TPoint = { x: 0, y: 0 },
          p2: TPoint = { x: container.x, y: container.y };

        // offset 为 偏移量
        const offset = xFlag
          ? (backgroundPositionLatest.current.x / 100) * (container.x - unfilledLength)
          : (backgroundPositionLatest.current.y / 100) * (container.y - unfilledLength);

        if (xFlag) {
          p1.x = 0 + offset;
          p2.x = unfilledLength + offset;
        } else {
          p1.y = 0 + offset;
          p2.y = unfilledLength + offset;
        }

        setDisplayRange({ p1, p2 });
        setDataRange({
          p1: { x: coordinate.p1.x, y: coordinate.p1.y },
          p2: { x: coordinate.p2.x, y: coordinate.p2.y },
        });
      } else {
        let displayP1: TPoint = { x: 0, y: 0 },
          displayP2: TPoint = { x: container.x, y: container.y };

        let dataP1: TPoint = {
            x: getDataPos({
              position: backgroundPositionLatest.current.x,
              containerLen: container.x,
              scaledLen: scale0SizeLatest.current.x * 2 ** (scaleLatest.current - 1),
              coorStart: coordinate.p1.x,
              coorEnd: coordinate.p2.x,
              isLowerCoor: true,
            }),
            y: getDataPos({
              position: 100 - backgroundPositionLatest.current.y,
              containerLen: container.y,
              scaledLen: scale0SizeLatest.current.y * 2 ** (scaleLatest.current - 1),
              coorStart: coordinate.p1.y,
              coorEnd: coordinate.p2.y,
              isLowerCoor: true,
            }),
          },
          dataP2: TPoint = {
            x: getDataPos({
              position: backgroundPositionLatest.current.x,
              containerLen: container.x,
              scaledLen: scale0SizeLatest.current.x * 2 ** (scaleLatest.current - 1),
              coorStart: coordinate.p1.x,
              coorEnd: coordinate.p2.x,
              isLowerCoor: false,
            }),
            y: getDataPos({
              position: 100 - backgroundPositionLatest.current.y,
              containerLen: container.y,
              scaledLen: scale0SizeLatest.current.y * 2 ** (scaleLatest.current - 1),
              coorStart: coordinate.p1.y,
              coorEnd: coordinate.p2.y,
              isLowerCoor: false,
            }),
          };
        if (unfillLineResult) {
          const { unfilledLength } = unfillLineResult;
          const offset = xFlag
            ? 0.5 * (container.x - unfilledLength)
            : 0.5 * (container.y - unfilledLength);
          if (xFlag) {
            displayP1.x = offset;
            displayP2.x = unfilledLength + offset;
            dataP1.x = coordinate.p1.x;
            dataP2.x = coordinate.p2.x;
          } else {
            displayP1.y = offset;
            displayP2.y = unfilledLength + offset;
            dataP1.y = coordinate.p1.y;
            dataP2.y = coordinate.p2.y;
          }
          setDisplayRange({ p1: displayP1, p2: displayP2 });
          setDataRange({ p1: dataP1, p2: dataP2 });
        } else {
          setDisplayRange({ p1: displayP1, p2: displayP2 });
          setDataRange({ p1: dataP1, p2: dataP2 });
        }
      }
    }

    function emptyData() {
      setBestValues([]);
      heatmapRef.current?.removeData();
    }

    function setHeatmapData() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setLoading(false);

        timerRef.current = undefined;
        const initialData = dataLatest.current;

        // 此处为实际渲染数据，x y 分别为实际页面上的 x y，originX originY 为原始的 x y
        const transData = getTransData({
          initialData: initialData,
          displayRange: displayRangeLatest.current,
          dataRange: dataRangeLatest.current,
          containerSize: getContainerSize(),
          colorRange: colorRangeLatest.current,
        });

        if (!isEmpty(transData)) {
          setBestValues([transData[transData.length - 1].value, transData[0].value]);
        }

        const datas = {
          data: transData,
          max: transData[0]?.value,
          // max: 5000
        };
        heatmapRef.current?.setData?.(datas);
      }, 120);
    }

    return (
      <div id="heatmapContainerWrapper" className={className}>
        <div
          id={`heatmapContainer-${uuidRef.current}`}
          className={`heatmapContainer ${moving && 'heatmapContainer-moving'}`}
          ref={wrapperRef}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: backgroundSize,
            backgroundPosition: `${backgroundPosition.x}% ${backgroundPosition.y}%`,
          }}
        ></div>
        <div className="heatmapTooltip" ref={tooltipRef}></div>
        <ColorRangeSlider
          bestValues={bestValues}
          data={dataCfg}
          scale={scale}
          setScale={setScale}
          colorRange={colorRange}
          setColorRange={setColorRange}
          setData={setDataCfg}
          wrapperDom={wrapperRef.current}
          triggerUpdateState={triggerUpdateState}
          localeMap={localeMap}
        />
      </div>
    );
  },
);

export default HeatMap
