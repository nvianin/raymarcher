const log = console.log



class App {
    constructor(shadermat) {
        this.handController = new HandController()

        this.renderer = new THREE.WebGLRenderer()
        /* this.renderer.pixelRatio = .5; */

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
                    },
                    dist: {
                        value: 1
                    },
                    pixelRatio: {
                        value: devicePixelRatio
                    },
                    middle_f: {
                        value: 0
                    },
                    ring_f: {
                        value: 0
                    },
                    little_f: {
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
        this.bloomPass.threshold = .15;
        this.bloomPass.strength = .23;
        this.bloomPass.radius = 2.8;
        this.composer.addPass(this.bloomPass)
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

        if (this.handController) {
            this.handController.update(dt)
            this.plane.material.uniforms.angle.value = -(this.handController.angle + 2.2) * 2
            this.plane.material.uniforms.power.value = this.handController.power

            this.plane.material.uniforms.middle_f.value = (this.handController.middle * 7) * Math.PI * 2;
            this.plane.material.uniforms.ring_f.value = (this.handController.ring * 7) * Math.PI * 2;
            this.plane.material.uniforms.little_f.value = (this.handController.little * 7) * Math.PI * 2;

            this.plane.material.uniforms.dist.value = 1.5 - this.handController.dist * 2
        }
    }

    setSize() {
        let pixelRatio = devicePixelRatio;
        this.renderer.setSize(innerWidth, innerHeight);
        this.composer.setSize(innerWidth, innerHeight);
        this.renderer.setPixelRatio(pixelRatio)
        this.composer.setPixelRatio(pixelRatio)
        this.plane.material.uniforms.u_resolution.value.x = innerWidth
        this.plane.material.uniforms.u_resolution.value.y = innerHeight
        this.plane.material.uniforms.pixelRatio.value = pixelRatio

        this.camera.aspect = innerWidth / innerHeight;
        this.camera.updateProjectionMatrix();
    }
}

window.addEventListener("load", async () => {
    const shadermat = await (await fetch("./raymarcher.glsl")).text()
    window.app = new App(shadermat);
})