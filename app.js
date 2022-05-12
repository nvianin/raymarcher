const log = console.log



class App {
    constructor(shadermat) {
        this.handController = new HandController()

        this.renderer = new THREE.WebGLRenderer()

        this.camera = new THREE.PerspectiveCamera(90, innerWidth / innerHeight, .1, 100);
        this.camera.position.z = .2;
        this.scene = new THREE.Scene()
        this.plane = new THREE.Mesh(
            new THREE.CircleGeometry(1, 3),
            new THREE.ShaderMaterial({
                fragmentShader: shadermat,
                uniforms: {
                    u_resolution: {
                        value: new THREE.Vector2()
                    },
                    u_time: {
                        value: 0
                    },
                    power: {
                        value: 2
                    },
                    angle: {
                        value: 0
                    }
                }
            })
        )
        this.plane.rotation.z = Math.PI / 2
        this.scene.add(this.plane)
        /* this.handController.trackers.forEach(t => {
            this.scene.add(t)
        }) */

        this.clock = new THREE.Clock()
        this.renderer.domElement.id = "three"
        document.body.appendChild(this.renderer.domElement)

        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera))

        this.SMAAPass = new THREE.SMAAPass(innerWidth * devicePixelRatio, innerHeight * devicePixelRatio)
        this.composer.addPass(this.SMAAPass);

        this.bloomPass = new THREE.UnrealBloomPass();
        this.bloomPass.threshold = .2;
        this.bloomPass.strength = .28;
        this.bloomPass.radius = .2;
        /* this.composer.addPass(this.bloomPass) */
        this.composer.addPass(new THREE.ShaderPass(THREE.CopyShader))

        this.setSize()
        window.addEventListener("resize", e => {
            this.setSize()
        })

        this.render()
    }
    render() {
        const dt = this.clock.getDelta()
        requestAnimationFrame(this.render.bind(this))
        this.composer.render();
        this.plane.material.uniforms.u_time.value = this.clock.getElapsedTime()
        this.handController.update(dt)
        this.plane.material.uniforms.angle.value = -(this.handController.angle + Math.PI / 1.2) * 2
        this.plane.material.uniforms.power.value = this.handController.power * 100
    }

    setSize() {
        this.renderer.setSize(innerWidth, innerHeight);
        this.composer.setSize(innerWidth, innerHeight);
        this.renderer.setPixelRatio(devicePixelRatio)
        this.composer.setPixelRatio(devicePixelRatio)
        this.plane.material.uniforms.u_resolution.value.x = innerWidth
        this.plane.material.uniforms.u_resolution.value.y = innerHeight

        this.camera.aspect = innerWidth / innerHeight;
        this.camera.updateProjectionMatrix();
    }
}

window.addEventListener("load", async () => {
    const shadermat = await (await fetch("./raymarcher.glsl")).text()
    window.app = new App(shadermat);
})