import * as THREE from "./node_modules/three/build/three.module.js"
const log = console.log
log(THREE)


class App {
    constructor(shadermat) {
        this.renderer = new THREE.WebGLRenderer()
        this.camera = new THREE.PerspectiveCamera(90, innerWidth / innerHeight, .1, 100);
        this.camera.position.z = .2;
        this.scene = new THREE.Scene()
        this.plane = new THREE.Mesh(
            new THREE.CircleGeometry(1, 3),
            new THREE.ShaderMaterial({
                fragmentShader: shadermat,
                uniforms: {
                    resolution: {
                        value: new THREE.Vector2()
                    },
                    time: {
                        value: 0
                    }
                }
            })
        )
        this.plane.rotation.z = Math.PI / 2
        this.scene.add(this.plane)
        this.setSize()
        this.clock = new THREE.Clock()
        document.body.appendChild(this.renderer.domElement)

        this.render()
    }
    render() {
        requestAnimationFrame(this.render.bind(this))
        this.renderer.render(this.scene, this.camera)
        this.plane.material.uniforms.time.value = this.clock.getElapsedTime()
    }

    setSize() {
        this.renderer.setSize(innerWidth, innerHeight);
        this.renderer.setPixelRatio(devicePixelRatio)
        this.plane.material.uniforms.resolution.x = innerWidth
        this.plane.material.uniforms.resolution.y = innerHeight
    }
}

window.addEventListener("load", async () => {
    const shadermat = await (await fetch("./raymarcher.glsl")).text()
    window.app = new App(shadermat);
})