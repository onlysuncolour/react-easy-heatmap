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
* Heat Point tooltip


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

### heatmapConfig

* optional

```typescript
type TheatmapConfig = {
  opacity?: number; // default 100
  radius?: number; // heatmap data point radius, default to 20
  theme?: number; // default to 0
}
```

### onConfigChange

* optional

Function being called when slider config changed.

Usually used to save slider config.

```typescript
type TonConfigChangeProp = TheatmapConfig
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

Used for i18n :)

```typescript
type THeatmapLocale = {
  opacity?: string;
  radius?: string;
  colorTheme?: string;
  reset?: string;
  zoomOut?: string;
  zoomIn?: string;
  setting?: string;
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

## Todo
* Button. Sorry for the bad-looking buttons. I will update them as soon as possible.
* More examples
* Less size. Because of the [heatmap.min.js](https://github.com/pa7/heatmap.js) and rc-slider, rc-tooltip, rc-checkbox, size looks a little large. will get rid of rc-components soom.
* radius auto-update when scale/containerSize changes

## Contact Me

This is my first npm package :)


Please raise issues in [github](https://github.com/onlysuncolour/react-easy-heatmap) or email me iyoungliu@163.com if you have any questions :)

## License

MIT © [](https://github.com/)
