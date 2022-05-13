class HandController {
    constructor() {
        this.video = document.querySelector("#input_video")
        this.canvas = document.querySelector("#debug_canvas")
        this.ctx = this.canvas.getContext("2d")

        this.hands = new Hands({
            locateFile: file => {
                return "https://cdn.jsdelivr.net/npm/@mediapipe/hands/" + file
            }
        })
        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        })
        log("Mediapipe loaded")
        this.hands.onResults(this.onResults.bind(this))

        this.camera = new Camera(this.video, {
            onFrame: async () => {
                await this.hands.send({
                    image: this.video
                })
            },

            width: 1280 * .5,
            height: 720 * .5
        })
        this.camera.start()

        this.trackers = []
        const tracker_number = 21;
        const trackerMat = new THREE.MeshBasicMaterial({
            color: "red"
        })
        for (let i = 0; i < tracker_number; i++) {
            this.trackers.push(
                new THREE.Mesh(
                    new THREE.SphereGeometry(.001),
                    trackerMat
                )
            )
        }

        this.angle = this.targetAngle = -2.1;
        this.power = this.targetPower = 7;
        this.angleLerper = new Math.PowerLerper(this.angle, this.angle, 2.);
        this.powerLerper = new Math.PowerLerper(this.power, this.power, .6);

        this.middle = 0;
        this.ring = 0;
        this.little = 0;

        this.middleLerper = new Math.PowerLerper(0, 0, 1);
        this.ringLerper = new Math.PowerLerper(0, 0, 1);
        this.littleLerper = new Math.PowerLerper(0, 0, 1);

        this.distanceLerper = new Math.PowerLerper(0, 0, 1)


        this.draw_debug = true;

    }

    update(dt) {
        this.angle = this.angleLerper.update(dt)
        this.dist = this.distanceLerper.update(dt)
        this.power = this.powerLerper.update(dt)

        this.middle = this.middleLerper.update(dt)
        this.ring = this.ringLerper.update(dt)
        this.little = this.littleLerper.update(dt)
    }

    onResults(results) {
        if (this.draw_debug) {
            this.ctx.save();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }

        if (results.multiHandLandmarks.length > 0) {
            let landmarks = results.multiHandLandmarks[0]
            /* console.log(landmarks) */

            if (this.draw_debug) {
                drawConnectors(this.ctx, landmarks, HAND_CONNECTIONS, {
                    color: '#00FF00',
                    lineWidth: 2
                });
                drawLandmarks(this.ctx, landmarks, {
                    color: '#FF0000',
                    lineWidth: .3
                });
            }


            landmarks = results.multiHandWorldLandmarks[0]
            const thumbLoc = new THREE.Vector3(landmarks[4].x, landmarks[4].y, landmarks[4].z);
            this.angleLerper.target = Math.atan2(landmarks[17].x - landmarks[0].x, landmarks[17].z - landmarks[0].z) + Math.PI
            this.powerLerper.target = Math.round(thumbLoc.distanceTo(landmarks[8]) * 100)

            this.middleLerper.target = thumbLoc.distanceTo(landmarks[12])
            this.ringLerper.target = thumbLoc.distanceTo(landmarks[16])
            this.littleLerper.target = thumbLoc.distanceTo(landmarks[20])
            console.log("angle: " + this.angle, "power: " + this.power)

            this.distanceLerper.target = new THREE.Vector3(results.multiHandLandmarks[0][0].x, results.multiHandLandmarks[0][0].y, results.multiHandLandmarks[0][0].z).distanceTo(results.multiHandLandmarks[0][9])

            /*const sc = .1
            for (let i = 0; i < 21; i++) {
                this.trackers[i].position.set(landmarks[i].x * sc, landmarks[i].y * -sc, landmarks[i].z * sc)
            } */
        }

    }
}