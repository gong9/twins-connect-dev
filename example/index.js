import ConnectWebgl from '../lib/index.es'

const container = document.getElementById('app')

const connectWebgl = new ConnectWebgl(container, {
    orbitControls: true,
    environmentMaps: true,
    enableDamping: true,
    width: window.innerWidth,
    height: window.innerHeight,
    near: 10,
    far: 100,
    imgSkybox: [
        './box/posx.jpg',
        './box/negx.jpg',
        './box/posy.jpg',
        './box/negy.jpg',
        './box/posz.jpg',
        './box/negz.jpg',
    ],
    orbitControlsTarget: {
        x: -255.66294843933684,
        y: 3.1552226346761305,
        z: 2.778067000658884,
    },
    lookAt: {
        x: -0.0164403845163225,
        y: -0.7563787157027716,
        z: -0.6539273294401923,
    },
    cameraPosition: {
        x: -249.48198348954315,
        y: 287.52511227364226,
        z: 248.63009673689166,
    },

})

connectWebgl.addModelInScene('./glb/fac1214.glb', true, {
    x: 0,
    y: 0,
    z: 0,
}, (e) => {
    console.log(e)
})

connectWebgl.addEventListener('cameraChange', ({
    position,
    target,
    orbitControlsTarget,
}) => {
    console.log('changeCameraPreset', position, target, orbitControlsTarget)
})

let demo = 1

const demo1 = () => {
    connectWebgl.setCameraLookAt({
        position: {
            x: 1 + demo,
            y: 1 + demo,
            z: 1 + demo,
        },
        target: {
            x: 0,
            y: 0,
            z: 0,
        },
        isTrigger: false,
    })

    demo++

    requestAnimationFrame(() => demo1())
}

demo1()