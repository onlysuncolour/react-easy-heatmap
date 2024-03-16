import { Theme_Rates, THEMES } from '../constants';

export const getGradientCfg = (index: number) => {
  const themes = THEMES[index || 0];
  const gradientCfg = {} as Record<number, string>;
  themes.forEach((t, index) => {
    gradientCfg[Theme_Rates[index]] = t;
  });

  return gradientCfg;
};

// 画轨道背景图片
export const getSliderTrackImg = (gradientCfg: Record<number, string>) => {
  const legendCanvas = document.createElement('canvas');
  legendCanvas.width = 12;
  legendCanvas.height = 96;
  const legendCtx = legendCanvas.getContext('2d');
  const gradient = legendCtx?.createLinearGradient?.(0, 0, 1, 96);
  for (const key in gradientCfg) {
    gradient?.addColorStop?.(key as unknown as number, gradientCfg[key]);
  }
  if (legendCtx && gradient) {
    legendCtx.fillStyle = gradient;
  }
  legendCtx?.fillRect?.(0, 0, 12, 96);

  return legendCanvas.toDataURL();
};
