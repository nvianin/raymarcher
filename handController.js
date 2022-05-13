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
        this.hands.onResults(this.onResults.bind(this))

        this.camera = new Camera(this.video, {
            onFrame: async () => {
                await this.hands.send({
                    image: this.video
                })
            },

            width: 1280,
            height: 720
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
        this.power = this.targetPower = 0.17;

        this.angleLerper = new Math.PowerLerper(this.angle, this.angle, .2);
        this.powerLerper = new Math.PowerLerper(this.power, this.power, .2);

    }

    update(dt) {
        this.angle = this.angleLerper.update(dt)
        this.power = this.powerLerper.update(dt)


    }

    onResults(results) {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();

        if (results.multiHandLandmarks.length > 0) {
            let landmarks = results.multiHandLandmarks[0]
            /* console.log(landmarks) */

            drawConnectors(this.ctx, landmarks, HAND_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 2
            });
            drawLandmarks(this.ctx, landmarks, {
                color: '#FF0000',
                lineWidth: .3
            });


            landmarks = results.multiHandWorldLandmarks[0]
            this.angleLerper.target = Math.atan2(landmarks[17].x - landmarks[0].x, landmarks[17].z - landmarks[0].z)
            this.powerLerper.target = new THREE.Vector3(landmarks[4].x, landmarks[4].y, landmarks[4].z).distanceTo(landmarks[8])
            console.log("angle: " + this.angle, "power: " + this.power)
            /*const sc = .1
            for (let i = 0; i < 21; i++) {
                this.trackers[i].position.set(landmarks[i].x * sc, landmarks[i].y * -sc, landmarks[i].z * sc)
            } */
        }

    }
}