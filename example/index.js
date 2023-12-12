import ConnectWebgl from '../lib/index.es'

const container = document.getElementById('app')

const connectWebgl = new ConnectWebgl(container, {
    orbitControls: true,
    environmentMaps: true,
    width: window.innerWidth,
    height: window.innerHeight,
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

connectWebgl.addModelInScene('./glb/fac.glb', true, {
    x: 0,
    y: 0,
    z: 0,
}, (e) => {
    console.log(e)
})

connectWebgl.addEventListener('cameraChange', ({
    position,
    target,
}) => {
    console.log('changeCameraPreset', position, target)
})