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
    fov: 60,
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
        x: 0.9394527691912565,
        y: 16.83615636567652,
        z: 44.10957788923065,
    },
    ground: './demo02.jpg',

})

connectWebgl.addModelInScene('./glb/11.glb', true)

connectWebgl.addEventListener('cameraChange', ({
    position,
    target,
    orbitControlsTarget,
}) => {
    console.log('changeCameraPreset', position, target)
})

// connectWebgl.changeCameraPreset({
//     poiId: 0,
// }, {
//     duration: 50000,
// })
// setTimeout(() => {
//     console.log('moveCameraTo')

//     connectWebgl.moveCameraTo({
//         x: -2220.13638,
//         y: 553.87818,
//         z: 171.07517,
//     }, {
//         x: 1.02890,
//         y: 0.49550,
//         z: 18.24786,
//     })
// }, 2000)

// setTimeout(() => {
//     console.log('setCameraLookAt')
//     connectWebgl.setCameraLookAt({
//         position: {
//             x: -48.17721280454367,
//             y: 351.8449685629147,
//             z: -2248.3125490088873,
//         },
//         target: {
//             x: 1.0289,
//             y: 0.4955,
//             z: 18.24786,
//         },

//     })
// }, 1000)

// let demo = 1

// const demo1 = () => {
//     connectWebgl.setCameraLookAt({
//         position: {
//             x: 1000,
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

// setTimeout(() => {
//     console.log(1222)
//     console.log(connectWebgl.getCameraLookAt())
// }, 3000)

setTimeout(() => {
    connectWebgl.setCameraLookAt({
        position: {
            x: 300,
            y: 300,
            z: 300,
        },
        target: {
            x: 100,
            y: 100,
            z: 100,
        },
        isTrigger: false,
        transition: {
            use: true,
            duration: 3,
        },
    })
}, 2000)