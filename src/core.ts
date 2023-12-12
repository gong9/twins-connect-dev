// @ts-nocheck  dts compile error, so when dev remove this line
import { ModelLoader, PMREMGenerator, SceneControl, Vector3, lib } from 'thunder-3d'
import localforage from 'localforage'

const modelLoader = new ModelLoader()

interface ConnectWebglOptions {
    orbitControls?: boolean
    orbitControlsTarget?: Vector3
    lookAt?: Vector3

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
    orbitControlsTarget: Vector3 | null
} : never

type ChangeTypeEvents<T> = ChangeTypeCbParameter<T>

interface SetCameraLookAtParameter {
    position: Vector3
    target: Vector3
}

class ConnectWebgl {
    private options: ConnectWebglOptions
    private eventMap: Partial<Record<ChangeType, Array<(params: ChangeTypeCbParameter<ChangeType>) => void>>> = {}

    container: HTMLElement
    sceneControl: SceneControl

    constructor(container: HTMLElement, options?: ConnectWebglOptions) {
        this.options = options ?? {}
        this.container = container
        this.sceneControl = this.init()
    }

    private init() {
        const { width, height, orbitControls, environmentMaps, cameraPosition, fov, near, far, orbitControlsTarget, lookAt } = this.options
        const scene = new SceneControl({
            orbitControls,
            ambientLight: true,
            reset: true,
            defCameraOps: {
                position: cameraPosition ?? new Vector3(10, 10, 10),
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

        scene.camera!.lookAt(lookAt ?? new Vector3(0, 0, 0))
        scene.controls!.target.copy(orbitControlsTarget ?? new Vector3(0, 0, 0))
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
                    orbitControlsTarget: sceneControl.controls?.target || null,
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
    async addModelInScene(source: string, isCache = true, position = new Vector3(0, 0, 0), onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) {
        const fileFormat = source.split('.').pop()

        if (isCache) {
            fetch(source).then(res => res.blob()).then((blob) => {
                localforage.setItem(source, blob)
            })
        }

        const blob = await localforage.getItem(source) as Blob
        let lastSource = source

        if (blob && isCache)
            lastSource = URL.createObjectURL(blob)

        if (fileFormat === 'glb' || fileFormat === 'gltf') {
            modelLoader.loadGLTF(lastSource, false, true,
                '/draco/',
                (model) => {
                    model.scene.position.set(position.x, position.y, position.z)
                    this.sceneControl.add(model.scene)
                    return model
                },
                onProgress,
                onError)
        }

        if (fileFormat === 'fbx') {
            modelLoader.loadFbx(lastSource, false, undefined, onProgress, onError).then((model) => {
                model.position.set(position.x, position.y, position.z)
                this.sceneControl.add(model)
            })
        }
    }

    /**
     * Set Camera Look At And Position
     * @param position
     * @param lookat
     */
    setCameraLookAt(params: SetCameraLookAtParameter) {
        const { position, target: lookat } = params

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

        // const direction = new Vector3()
        // this.sceneControl.camera!.getWorldDirection(direction)

        // this.triggerChange(change, {
        //     position: this.sceneControl.camera!.position,
        //     target: direction,
        // } as any)
    }

    removeEventListener<T extends ChangeType>(change: T, cb: (params: ChangeTypeCbParameter<T>) => void) {
        if (this.eventMap[change])
            this.eventMap[change] = this.eventMap[change]!.filter(fn => fn !== cb)
    }
}

export default ConnectWebgl
