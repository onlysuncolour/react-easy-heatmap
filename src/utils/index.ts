import isEmpty from './isEmpty';
import isEqual from './isEqual';

type TPoint = {
  x: number;
  y: number;
};

// 获得未占满的那个轴
export function getUnfilledAxis(
  scaleValue: number,
  containerSize: TPoint,
  imageScale0Value: TPoint,
  xFlag: boolean,
): {
  // xFlag: boolean;
  unfilledLength: number;
} | null {
  if (
    imageScale0Value.x * 2 ** (scaleValue - 1) > containerSize.x &&
    imageScale0Value.y * 2 ** (scaleValue - 1) > containerSize.y
  ) {
    return null;
  }
  // const xFlag = imageScale0Value.x * 2 ** (scaleValue - 1) >= containerSize.x ? false : true;
  const unfilledLength = xFlag
    ? imageScale0Value.x * 2 ** (scaleValue - 1)
    : imageScale0Value.y * 2 ** (scaleValue - 1);

  return {
    // xFlag,
    unfilledLength,
  };
}

// 获得image在当前container下，不zoomOutzoomIn的情况下，实际的宽高
export function getScale0Value(containerSize: TPoint, imageSize: TPoint) {
  const ratioW = imageSize.x / containerSize.x;
  const ratioH = imageSize.y / containerSize.y;
  let scale = Math.max(ratioW, ratioH);
  let autoW = ratioW < ratioH;

  return {
    x: !autoW ? containerSize.x : imageSize.x / scale,
    y: !autoW ? imageSize.y / scale : containerSize.y,
    xFlag: autoW,
    bgSizePercent: [autoW ? 0 : 1, autoW ? 1 : 0],
  };
}

// position 0 - start
// position 100 - end
// position 50 - center
// containerLen - container length
// scaledLen - scaled image length
// imgLen - image length
// coorStart - coordinate start
// coorEnd - coordinate end
// isLowerCoor - is lower coordinate
export function getDataPos({
  position,
  containerLen,
  scaledLen,
  coorStart,
  coorEnd,
  isLowerCoor,
}: {
  position: number;
  containerLen: number;
  scaledLen: number;
  coorStart: number;
  coorEnd: number;
  isLowerCoor: boolean;
}) {
  const coorLen = coorEnd - coorStart;
  const scaledPos =
    (position / 100) * scaledLen +
    (isLowerCoor ? -position / 100 : (100 - position) / 100) * containerLen;
  const coorPos = (scaledPos * coorLen) / scaledLen + coorStart;
  return coorPos;
}

export function getPosTrans({
  curP,
  reverseLen,
  scale,
  constantValue,
}: {
  curP: number;
  reverseLen?: number;
  scale: number;
  constantValue: number;
}): number {
  /**
   * scale * coor1 + constantValue = pos1
   * scale * coor2 + constantValue = pos2
   * scale = (pos1 - pos2) / (coor1 - coor2)
   * constantValue = pos1 - constantValue * coor1
   * scale * curCoor + constantValue = curPos
   *
   * y axis => need to reverse
   * reverseLen is the length of the scaled length
   */
  let curPs = constantValue * curP + scale;
  if (reverseLen) {
    curPs = reverseLen - curPs;
  }
  return Number(curPs.toFixed(2));
}

// 获取坐标转换的因子, 因子说明见 getPosTrans 方法
function getCoordinateTransformFactor({
  pos1,
  pos2,
  coor1,
  coor2,
}: {
  pos1: number;
  pos2: number;
  coor1: number;
  coor2: number;
}) {
  const constantValue = (pos1 - pos2) / (coor1 - coor2);
  const scale = pos1 - constantValue * coor1;
  return { scale, constantValue };
}

type TMapDataType = {
  originX: number
  originY: number
  x: number
  y: number
  value: number
}
// 获得实际渲染数据，结果中 x y 分别为实际页面上的 x y，originX originY 为原始的 x y
export function getTransData({
  initialData,
  displayRange,
  dataRange,
  containerSize,
  colorRange,
}: {
  initialData: any[];
  displayRange: {
    p1: TPoint;
    p2: TPoint;
  };
  dataRange: {
    p1: TPoint;
    p2: TPoint;
  };
  containerSize: TPoint;
  colorRange: number[];
}): { x: number; y: number; value: number }[] {
  const { constantValue: cx, scale: sx } = getCoordinateTransformFactor({
    coor1: dataRange.p1.x,
    pos1: displayRange.p1.x,
    coor2: dataRange.p2.x,
    pos2: displayRange.p2.x,
  });
  const { constantValue: cy, scale: sy } = getCoordinateTransformFactor({
    coor1: dataRange.p1.y,
    pos1: displayRange.p1.y,
    coor2: dataRange.p2.y,
    pos2: displayRange.p2.y,
  });

  let mapData:TMapDataType[] = [];
  const { x: x1, y: y1 } = dataRange.p1;
  const { x: x2, y: y2 } = dataRange.p2;
  const xMin = Math.min(x1, x2),
    xMax = Math.max(x1, x2),
    yMin = Math.min(y1, y2),
    yMax = Math.max(y1, y2);
  (initialData || []).forEach((d) => {
    const { x, y } = d;
    if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
      mapData.push({
        originX: x,
        originY: y,
        x: getPosTrans({
          constantValue: cx,
          scale: sx,
          curP: x,
        }),
        y: getPosTrans({
          constantValue: cy,
          scale: sy,
          curP: y,
          reverseLen: containerSize.y,
        }),
        value: d.value,
      });
    }
  });
  if (mapData.length > 1 && !isEmpty(colorRange) && !isEqual(colorRange, [0, 1])) {
    let start = 0,
      end = mapData.length - 1;
    if (colorRange[1] !== 1) {
      start = Math.ceil(mapData.length * (1 - colorRange[1]));
      if (mapData[start] === undefined) {
        start--;
      }
    }
    if (colorRange[0] !== 0) {
      end = Math.floor(mapData.length * (1 - colorRange[0]));
      if (mapData[end] === undefined) {
        end--;
      }
    }
    let startValue = mapData[start].value,
      endValue = mapData[end].value;
    start = mapData.findIndex((d) => d.value === startValue);
    // @ts-ignore
    end = mapData.findLastIndex((d) => d.value === endValue);
    mapData = mapData.slice(start, end + 1);
  }
  return mapData;
}

export function getPosDeTrans({
  curP,
  reverseLen,
  scale,
  constantValue,
}: {
  curP: number;
  reverseLen?: number;
  scale: number;
  constantValue: number;
}): number {
  let t = curP;
  if (reverseLen) {
    t = reverseLen - t;
  }
  return transNumberFix2((t - scale) / constantValue);
}

type TDoublePointType = {
  p1: TPoint
  p2: TPoint
}

type TGetRealCoordinateProps = {
  displayRange: TDoublePointType, 
  dataRange: TDoublePointType, 
  containerSize: TPoint, 
  curPos: TPoint
}
export function getRealCoordinate({ displayRange, dataRange, containerSize, curPos } : TGetRealCoordinateProps) {
  const { constantValue: cx, scale: sx } = getCoordinateTransformFactor({
    coor1: dataRange.p1.x,
    pos1: displayRange.p1.x,
    coor2: dataRange.p2.x,
    pos2: displayRange.p2.x,
  });
  const { constantValue: cy, scale: sy } = getCoordinateTransformFactor({
    coor1: dataRange.p1.y,
    pos1: displayRange.p1.y,
    coor2: dataRange.p2.y,
    pos2: displayRange.p2.y,
  });
  const result = {
    x: getPosDeTrans({
      constantValue: cx,
      scale: sx,
      curP: curPos.x,
    }),
    y: getPosDeTrans({
      constantValue: cy,
      scale: sy,
      curP: curPos.y,
      reverseLen: containerSize.y,
    }),
  };
  return result;
}

export function debounce(func: Function, timeout = 300) {
  let timer: NodeJS.Timeout;
  // @ts-ignore
  return (...args) => {
    clearTimeout(timer);
    // @ts-ignore
    timer = setTimeout(() => {
      // @ts-ignore
      func.apply(this, args);
    }, timeout);
  };
}

function transNumberFix2(num: number) {
  let flag = num < 0;
  const _num = Math.abs(num);
  let result;
  if (_num > 0.1 || _num === 0) {
    result = Number(_num.toFixed(2));
  } else {
    let prefix = '0.',
      str = `${_num}`,
      i = 0;
    str = str.replace('0.', '');
    while (str[i] === '0') {
      i++;
      prefix += '0';
    }
    str = str.substring(i, i + 3);
    str = (+`0.${str}`).toFixed(2);
    str = str.replace('0.', prefix);
    result = Number(str);
  }
  return flag ? -result : result;
}

function rgbToHex(r: number, g: number, b: number) {
  var hex = ((r << 16) | (g << 8) | b).toString(16);
  return '#' + new Array(Math.abs(hex.length - 7)).join('0') + hex;
}

function hexToRgb(hex: string) {
  var rgb = [];
  for (var i = 1; i < 7; i += 2) {
    rgb.push(parseInt('0x' + hex.slice(i, i + 2)));
  }
  return rgb;
}

export const getTargetColors = (startColor: string, endColor: string, step: number) => {
  //将hex转换为rgb
  var sColor = hexToRgb(startColor),
    eColor = hexToRgb(endColor);

  //计算R\G\B每一步的差值
  var rStep = (eColor[0] - sColor[0]) / step,
    gStep = (eColor[1] - sColor[1]) / step,
    bStep = (eColor[2] - sColor[2]) / step;

  const gradientColorArr = [];
  for (let i = 0; i < step; i++) {
    //计算每一步的hex值
    gradientColorArr.push(
      rgbToHex(
        parseInt(rStep * i + sColor[0] + ''),
        parseInt(gStep * i + sColor[1] + ''),
        parseInt(bStep * i + sColor[2] + ''),
      ),
    );
  }

  return gradientColorArr;
};


type TCommonValue = number | string;

export function toFloat(v: TCommonValue, d = 2, strict = false): TCommonValue {
  const num = Number(v);
  return isNaN(num) ? '-' : strict ? num.toFixed(d) : Number(num.toFixed(d));
}

export function toThousand(v: TCommonValue, d = 2, locale = 'en-US'): string {
  const num = toFloat(v, d);
  return num === '-'
    ? '-'
    : num.toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: d,
      });
}

export function toPercent(v: TCommonValue, d = 2): string {
  const num = toThousand(toFloat(Number(v) * 100, d));
  return num === '-' ? '-' : `${num}%`;
}