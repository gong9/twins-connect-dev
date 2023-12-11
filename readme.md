# twins-connect-dev

### Install

```bash
npm install twins-connect-dev
```

### Usage

```js
import ConnectWebgl from 'twins-connect-dev'

const container = document.getElementById('app')
const connectWebgl = new ConnectWebgl(container, {
    orbitControls: true,
    environmentMaps: true,
    width: window.innerWidth,
    height: window.innerHeight,
})

connectWebgl.addModelInScene('./glb/fac.glb')

connectWebgl.addEventListener('cameraChange', ({
    position,
    target,
}) => {
    console.log('changeCameraPreset', position, target)
})
```


### API

- setCameraLookAt  设置相机位置和朝向
- getCameraLookAt  获取相机位置和朝向
- events    
    - addEventListener
    - removeEventListener
        - cameraChange  相机位置和朝向发生变化之后触发

- changeCameraPreset 切换相机位置和朝向  【wip】
    - position
    - target
    - duration
    - easing
    - callback