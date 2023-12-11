import ConnectWebgl from '../lib/index.es'

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