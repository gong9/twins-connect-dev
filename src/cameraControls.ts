import {
    Box3,
    Clock,
    Matrix4,
    Quaternion,
    Raycaster,
    Sphere,
    Spherical,
    Vector2,
    Vector3,
    Vector4,
} from 'thunder-3d'
import CameraControls from 'camera-controls'

const subsetOfTHREE = {
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
}

const clock = new Clock()
CameraControls.install({ THREE: subsetOfTHREE })

export { clock, CameraControls }