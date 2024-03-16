import React from 'react'

import HeatMap from 'react-easy-heatmap'
import 'react-easy-heatmap/dist/index.css'

const data = [
  [1,1,100],
  [2,2,100],
  [2,2,100],
  [2,2,100],
  [2,2,100],
]
const App = () => {
  return <div
    style={{
      width: '800px',
      height: '400px'
    }}
  ><HeatMap data={data} /></div>
}

export default App
