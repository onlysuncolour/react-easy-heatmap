# react-easy-heatmap

> Made with create-react-library

[![NPM](https://img.shields.io/npm/v/react-easy-heatmap.svg)](https://www.npmjs.com/package/react-easy-heatmap) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-easy-heatmap
```

## Usage

```tsx
import React, { Component } from 'react'

import Heatmap from 'react-easy-heatmap'
import 'react-easy-heatmap/dist/index.css'

class Example extends Component {
  render() {
    return <Heatmap />
  }
}
```

## Main Features
* Simplified API
* Adaptable zooming of the map
* Map Zoom out & Zoom in
* Map dragging
* Color configured
* Data scaled by slider


## API
### data

* required

```typescript
[xCoordinate: number, yCoordinate: number, value: number][]
```

### mapFile

* optional. Default to a transparent png.

```typescript
type TPoint = {
  x: number; // x coordinate or width
  y: number; // y coordinate or height
}
type TMapFile = {
  image: string; // img url
  imgSize: TPoint
  coordinate: {
    x: TPoint; // left bottom point's coordinate
    y: TPoint; // right top point's coordinate
  }
}
```

### sliderCfg

* optional

```typescript
type TSliderCfg = {
  opacity?: number; // default 100
  radius?: number; // heatmap data point radius, default to 20
  theme?: number; // default to 0
}
```

### onCfgChange

* optional

Function being called when slider config changed.

Usually used to save slider config.

```typescript
type TOnCfgChangeProp = TSliderCfg
```
### onPostionChange

* optional

Function being called when heatmap scale change or be dragged.

Usually used to sync operations from multi-heatmaps

```typescript
type TOnPositionChangeProp = {
  scale: number
  bgP: {
    x: TPoint;
    y: TPoint;
  }
}
```
### localeMap

* optional

```typescript
type THeatmapLocale = {
  不透明度?: string;
  半径?: string;
  配色方案?: string;
  还原?: string;
  放大?: string;
  缩小?: string;
  设置?: string;
}
```
### documentResizeEventKey

* optional

Event key bound in document, will cause heatmap resize when being triggered

```typescript
type TDocumentResizeEventKey = string;
```

### Ref - handleSyncAction

Used to sync operations from multi-heatmaps

```typescript
type THandleSyncActionProp = {
  scale: number
  bgP: {
    x: TPoint;
    y: TPoint;
  }
}
```
## License

MIT © [](https://github.com/)
