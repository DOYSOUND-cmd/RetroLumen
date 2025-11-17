import { createEmitter } from "./helpers.js";

export default class CaptureSession {
    constructor({ stream, type }) {
        this.stream = stream;
        this.type = type;
        this.video = null;
        this.frameRequest = null;
        this.timer = null;
        this.events = createEmitter();
    }

    async start() {
        if(this.video) return;
        this.video = document.createElement("video");
        this.video.srcObject = this.stream;
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.hidden = true;
        document.body.appendChild(this.video);
        await this.video.play();
        this._beginFrameLoop();
    }

    _beginFrameLoop() {
        const useRVFC = "requestVideoFrameCallback" in HTMLVideoElement.prototype;
        if(useRVFC) {
            const next = () => {
                if(!this.video) return;
                this.video.requestVideoFrameCallback((now, metadata) => {
                    this.events.emit("frame", { video: this.video, now, metadata });
                    next();
                });
            };
            this.frameRequest = true;
            next();
        } else {
            this.timer = setInterval(() => {
                if(!this.video) return;
                this.events.emit("frame", { video: this.video, now: performance.now(), metadata: {} });
            }, 16);
        }
    }

    stop() {
        this.frameRequest = null;
        if(this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.stream?.getTracks().forEach((track) => track.stop());
        if(this.video) {
            this.video.pause();
            this.video.srcObject = null;
            this.video.remove();
            this.video = null;
        }
        this.events.clear();
    }
}

