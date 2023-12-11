// @ts-nocheck  dts compile error, so when dev remove this line
import { ModelLoader, PMREMGenerator, SceneControl, Vector3, lib } from 'thunder-3d'

const modelLoader = new ModelLoader()

interface ConnectWebglOptions {
    orbitControls?: boolean

    /** canvas scene w&h */
    width?: number
    height?: number

    /** if need environment mapping */
    environmentMaps?: boolean

    /** camera config */
    cameraPosition?: Vector3
    fov?: number
    near?: number
    far?: number
}

type ChangeType = 'cameraChange'

type ChangeTypeCbParameter<T> = T extends 'cameraChange' ? {
    position: Vector3
    target: Vector3
} : never

type ChangeTypeEvents<T> = ChangeTypeCbParameter<T>

class ConnectWebgl {
    private options: ConnectWebglOptions

    container: HTMLElement
    sceneControl: SceneControl

    private lookAt: Vector3 = new Vector3(0, 0, 0)
    private eventMap: Partial<Record<ChangeType, Array<(params: ChangeTypeCbParameter<ChangeType>) => void>>> = {}

    constructor(container: HTMLElement, options?: ConnectWebglOptions) {
        this.options = options ?? {}
        this.container = container
        this.sceneControl = this.init()
    }

    private init() {
        const { width, height, orbitControls, environmentMaps, cameraPosition, fov, near, far } = this.options
        const scene = new SceneControl({
            orbitControls,
            ambientLight: true,
            reset: true,
            defCameraOps: {
                position: new Vector3(100, 100, 0),
                fov: fov ?? 90,
                aspect: width && height ? width / height : 1,
                near: near ?? 0.1,
                far: far ?? 10000,
            },
            rendererOps: {
                size: {
                    width: width ?? this.container.clientWidth,
                    height: height ?? this.container.clientHeight,
                },
            },
        })
        scene.render(this.container)

        this.intrusionCode(scene)

        if (environmentMaps) {
            const pmremGenerator = new PMREMGenerator(scene.renderer!)
            pmremGenerator.compileEquirectangularShader()

            // @ts-ignore
            const roomEnvironment = new lib.RoomEnvironment()
            scene.scene!.environment = pmremGenerator.fromScene(roomEnvironment, 0.04).texture
        }

        return scene
    }

    /**
     * Intrusion Camera Code
     * @param sceneControl
     */
    private intrusionCode(sceneControl: SceneControl) {
        if (sceneControl.controls) {
            sceneControl.controls.addEventListener('change', () => {
                const direction = new Vector3()
                sceneControl.camera!.getWorldDirection(direction)

                this.triggerChange('cameraChange', {
                    position: sceneControl.camera!.position,
                    target: direction,
                })
            })
        }

        // TODO, if not has controls
    }

    /**
     * Trigger Change
     * @param change
     * @param events
     */
    private triggerChange<T extends ChangeType>(change: T, events: ChangeTypeEvents<T>) {
        if (this.eventMap[change])
            this.eventMap[change]!.forEach(cb => cb(events))
    }

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

    addEventListener<T extends ChangeType>(change: T, cb: (params: ChangeTypeCbParameter<T>) => void) {
        if (this.eventMap[change])
            this.eventMap[change]!.push(cb as any)

        else
            (this.eventMap[change] as any) = [cb]

        const direction = new Vector3()
        this.sceneControl.camera!.getWorldDirection(direction)

        this.triggerChange(change, {
            position: this.sceneControl.camera!.position,
            target: direction,
        } as any)
    }

    removeEventListener<T extends ChangeType>(change: T, cb: (params: ChangeTypeCbParameter<T>) => void) {
        if (this.eventMap[change])
            this.eventMap[change] = this.eventMap[change]!.filter(fn => fn !== cb)
    }
}

export default ConnectWebgl
