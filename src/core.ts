// @ts-nocheck  dts compile error, so when dev remove this line
import type { Scene } from 'thunder-3d'
import {
    CubeTextureLoader,
    EquirectangularReflectionMapping,
    ModelLoader,
    PMREMGenerator,
    SceneControl,
    Vector3,
    lib,
    use,
} from 'thunder-3d'
import localforage from 'localforage'

import { poiPreset } from './preset'
import { CameraControls, clock } from './cameraControls'

const modelLoader = new ModelLoader()
const rgbeLoader = new lib.RGBELoader()

interface ConnectWebglOptions {
    orbitControls?: boolean
    dampingFactor?: number
    enableDamping?: boolean
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

    /** skybox */
    hrdSkybox?: string
    imgSkybox?: string[]
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
    isTrigger: boolean
}

interface ChangeCameraPresetParameter {
    poiId: string
}

class ConnectWebgl {
    private options: ConnectWebglOptions
    private eventMap: Partial<Record<ChangeType, Array<(params: ChangeTypeCbParameter<ChangeType>) => void>>> = {}
    private isTrigger = true
    private cameraControls: CameraControls | null = null
    private isMoveing = false
    private setTargeting = false
    private isEnabledCameraControls = false

    container: HTMLElement
    sceneControl: SceneControl

    constructor(container: HTMLElement, options?: ConnectWebglOptions) {
        this.options = options ?? {}
        this.container = container
        this.sceneControl = this.init()

        options?.hrdSkybox && this.setSkyboxHdr(options.hrdSkybox, this.sceneControl.scene!)
        options?.imgSkybox && this.setsetSkyboxImg(options.imgSkybox, this.sceneControl.scene!)
    }

    private init() {
        const { width, height, orbitControls, environmentMaps, cameraPosition, fov, near, far, orbitControlsTarget, lookAt, dampingFactor, enableDamping } = this.options
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

        this.cameraControls = new CameraControls(scene.camera!, scene.renderer!.domElement)
        this.cameraControls.enabled = this.isEnabledCameraControls

        use.useframe(() => {
            const delta = clock.getDelta()
            const hasControlsUpdated = this.cameraControls!.update(delta)
            scene.renderer!.render(scene.scene!, scene.camera!)
        })

        scene.controls!.enableDamping = enableDamping ?? false
        scene.controls!.dampingFactor = dampingFactor ?? 0.05

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
     * setSkybox hdr
     * @param hrdSkybox
     * @param scene
     */
    private setSkyboxHdr(hrdSkybox: string, scene: Scene) {
        rgbeLoader.load(hrdSkybox, (texture) => {
            texture.mapping = EquirectangularReflectionMapping
            scene.background = texture
        })
    }

    /**
     * setSkybox boxImg
     * @param imgSkybox
     * @param scene
     */
    private setsetSkyboxImg(imgSkybox: string[], scene: Scene) {
        const cubeTextureLoader = new CubeTextureLoader()
        cubeTextureLoader.load(imgSkybox, (texture) => {
            scene.background = texture
        })
    }

    /**
     * Intrusion Camera Code
     * @param sceneControl
     */
    private intrusionCode(sceneControl: SceneControl) {
        if (sceneControl.controls) {
            sceneControl.controls.addEventListener('change', () => {
                if (this.isTrigger) {
                    const direction = new Vector3()
                    sceneControl.camera!.getWorldDirection(direction)
                    this.triggerChange('cameraChange', {
                        position: sceneControl.camera!.position,
                        target: direction,
                        orbitControlsTarget: sceneControl.controls?.target || null,
                    })
                }
                else {
                    this.isTrigger = true
                }
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
                './draco/',
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
        const { position, target: lookat, isTrigger } = params
        this.isTrigger = isTrigger ?? true

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
    }

    removeEventListener<T extends ChangeType>(change: T, cb: (params: ChangeTypeCbParameter<T>) => void) {
        if (this.eventMap[change])
            this.eventMap[change] = this.eventMap[change]!.filter(fn => fn !== cb)
    }

    moveCameraTo(position: Vector3, target: Vector3) {
        this.cameraControls!.enabled = true
        this.isMoveing = true
        this.setTargeting = true

        this.cameraControls!.moveTo(position.x, position.y, position.z, true).then(() => {
            this.isMoveing = false
            if (!this.isMoveing && !this.setTargeting)
                this.cameraControls!.enabled = false
        })
        this.cameraControls!.setTarget(target.x, target.y, target.z, true).then(() => {
            this.setTargeting = false

            if (!this.isMoveing && !this.setTargeting)
                this.cameraControls!.enabled = false
        })
    }

    /**
     * camera animation
     * @param params
     */
    changeCameraPreset(params: ChangeCameraPresetParameter) {
        // @ts-ignore
        const currentData = poiPreset[params.poiId]

        if (currentData)
            this.moveCameraTo(currentData.position, currentData.lookAt)

        else console.error(`The poiId ${params.poiId} is not exist`)
    }
}

export default ConnectWebgl
