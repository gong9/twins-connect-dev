import ConnectWebgl from '../lib/index.es'

const container = document.getElementById('app')

const connectWebgl = new ConnectWebgl(container, {
    orbitControls: true,
    environmentMaps: true,
    enableDamping: true,
    width: window.innerWidth,
    height: window.innerHeight,
    near: 0.1,
    far: 100000,
    imgSkybox: [
        './box/posx.jpg',
        './box/negx.jpg',
        './box/posy.jpg',
        './box/negy.jpg',
        './box/posz.jpg',
        './box/negz.jpg',
    ],
    lookAt: {
        x: 0,
        y: 0,
        z: 0,
    },
    cameraPosition: {
        x: 0,
        y: 0,
        z: 0,
    },

})

connectWebgl.addModelInScene('./glb/fac1214.glb', true, {
    x: 0,
    y: 0,
    z: 0,
})

connectWebgl.addEventListener('cameraChange', ({
    position,
    target,
    orbitControlsTarget,
}) => {
    // console.log('changeCameraPreset', position, target, orbitControlsTarget)
})

setTimeout(() => {
    console.log('moveCameraTo')

    connectWebgl.moveCameraTo({
        x: 220.13638,
        y: 553.87818,
        z: 171.07517,
    }, {
        x: 1.02890,
        y: 0.49550,
        z: 18.24786,
    })
}, 2000)

// let demo = 1

// const demo1 = () => {
//     connectWebgl.setCameraLookAt({
//         position: {
//             x: 0,
//             y: 0.0001 + demo,
//             z: 0,
//         },
//         target: {
//             x: 0,
//             y: 0,
//             z: 0,
//         },
//         isTrigger: false,
//     })

//     demo++

//     requestAnimationFrame(() => demo1())
// }

// demo1()