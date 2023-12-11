import ConnectWebgl from '../lib/index.es'

const container = document.getElementById('app')

const connectWebgl = new ConnectWebgl(container, {
    orbitControls: true,
    width: window.innerWidth,
    height: window.innerHeight,
})

connectWebgl.addModelInScene('./glb/fac.glb')

console.log(connectWebgl.sceneControl.scene)