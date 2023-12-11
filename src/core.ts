import type { PerspectiveCamera } from 'thunder-3d'
import { ModelLoader, PMREMGenerator, SceneControl, Vector3, lib } from 'thunder-3d'

const modelLoader = new ModelLoader()

interface ConnectWebglOptions {
    orbitControls?: boolean

    /** canvas scene w&h */
    width?: number
    height?: number
}

type ChangeType = 'changeCameraPreset'

type ChangeTypeCbParameter<T> = T extends 'changeCameraPreset' ? {
    position: Vector3
    target: Vector3
} : never

type ChangeTypeEvents<T> = ChangeTypeCbParameter<T>

class ConnectWebgl {
    private options: ConnectWebglOptions

    container: HTMLElement
    sceneControl: SceneControl

    private lookAt: Vector3 = new Vector3(0, 0, 0)

    constructor(container: HTMLElement, options?: ConnectWebglOptions) {
        this.options = options ?? {}
        this.container = container
        this.sceneControl = this.init()
    }

    private init() {
        const { width, height, orbitControls } = this.options
        const scene = new SceneControl({
            orbitControls,
            ambientLight: true,
            reset: true,
            rendererOps: {
                size: {
                    width: width ?? this.container.clientWidth,
                    height: height ?? this.container.clientHeight,
                },
            },
        })
        scene.render(this.container)

        this.intrusionCode(scene.camera!)

        const pmremGenerator = new PMREMGenerator(scene.renderer!)
        pmremGenerator.compileEquirectangularShader()

        // @ts-expect-error
        const roomEnvironment = new lib.RoomEnvironment()
        scene.scene!.environment = pmremGenerator.fromScene(roomEnvironment, 0.04).texture

        return scene
    }

    /**
     * Intrusion Camera Code
     * @param camera
     */
    private intrusionCode(camera: PerspectiveCamera) {
        const context = this

        camera.position.set = function (x: number, y: number, z: number) {
            console.log('set camera position', x, y, z)

            context.triggerChange('changeCameraPreset', {
                position: new Vector3(x, y, z),
                target: context.lookAt,
            })

            return camera.position.set(x, y, z)
        }

        // camera.lookAt = function (vector: any) {
        //     console.log('set camera position', vector)

        //     this.lookAt = vector
        //     context.triggerChange('changeCameraPreset', {
        //         position: camera.position,
        //         target: vector,
        //     })

        //     return camera.lookAt(vector)
        // }
    }

    private triggerChange<T extends ChangeType>(change: T, events: ChangeTypeEvents<T>) { }

    /**
     * Add Model In Scene
     * @param source
     * @param isCache
     * @param onProgress
     * @param onError
     */
    addModelInScene(source: string, isCache = true, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) {
        const fileFormat = source.split('.').pop()

        if (fileFormat === 'glb' || fileFormat === 'gltf') {
            modelLoader.loadGLTF(source, false, true, '/draco/', undefined, onProgress, onError).then((model) => {
                this.sceneControl.add(model.scene)
            })
        }

        if (fileFormat === 'fbx') {
            modelLoader.loadFbx(source, false, undefined, onProgress, onError).then((model) => {
                this.sceneControl.add(model)
            })
        }
    }

    /**
     * Set Camera Look At And Position
     * @param position
     * @param lookat
     */
    setCameraLookAt(position: Vector3, lookat: Vector3) {
        if (this.sceneControl.camera) {
            this.sceneControl.camera.position.set(position.x, position.y, position.z)
            this.sceneControl.camera.lookAt(lookat)
        }
    }

    /**
     * Get Camera Look At And Position
     * @returns
     */
    getCameraLookAt() {
        if (this.sceneControl.camera) {
            return {
                position: this.sceneControl.camera?.position,
                target: this.sceneControl.camera?.lookAt,
            }
        }
    }

    changeCameraPreset() { }

    addEventListener<T extends ChangeType>(change: T, cb: (params: ChangeTypeCbParameter<T>) => void) { }

    removeEventListener() { }
}

export default ConnectWebgl
