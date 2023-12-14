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

#### 构造函数

```ts
interface ConnectWebglOptions {
    orbitControls?: boolean // 是否开启轨道控制器  默认 ture，不要关闭
    orbitControlsTarget?: Vector3 // 轨道控制器目标点  默认 (0,0,0)
    enableDamping?: boolean // 轨道控制器是否开启阻尼效果  默认 false
    dampingFactor?: number // 轨道控制器阻尼系数  默认 0.05

    /** canvas scene w&h */
    width?: number // canvas 宽度
    height?: number // canvas 高度

    /** if need environment mapping */
    environmentMaps?: boolean // 是否需要环境贴图

    /** camera config */
    lookAt?: Vector3
    cameraPosition?: Vector3 // 相机初始化位置
    fov?: number // 相机视角
    near?: number // 相机近平面
    far?: number // 相机远平面

    /** skybox */
    hrdSkybox?: string // 天空盒hrd图片地址
    imgSkybox?: string // 天空盒img图片地址
}
```

#### 实例方法
- setCameraLookAt  设置相机位置和朝向
    - 参数 object
        - position 相机位置
        - target 相机朝向
        - isTrigger 是否触发 cameraChange 事件 默认 true
    
- getCameraLookAt  获取相机位置和朝向
- events    
    - addEventListener
    - removeEventListener
        - cameraChange  相机位置和朝向发生变化之后触发
- addModelInScene
    - source 模型资源地址
    - isCache 是否缓存模型
    - position 模型位置 默认 (0,0,0)
    - onProgress 模型加载进度回调
    - onError 模型加载失败回调

- changeCameraPreset 切换相机位置和朝向  【wip】
