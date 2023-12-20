import { Mesh, MeshBasicMaterial, PlaneGeometry, TextureLoader } from 'thunder-3d'

export const createGround = (ground: string) => {
    const texture = new TextureLoader().load(ground)
    // texture.wrapS = texture.wrapT = 1000
    // texture.repeat.set(1000, 1000)

    const geometry = new PlaneGeometry(4000 * 2, 2500 * 2)
    const material = new MeshBasicMaterial({ map: texture })
    const mesh = new Mesh(geometry, material)
    mesh.rotateX(-Math.PI / 2)
    mesh.position.x = 500 * 2
    mesh.position.z = -700 * 2
    mesh.name = 'ground'

    return mesh
}