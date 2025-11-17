import { createEmitter, formatError } from "./helpers.js";
import CaptureSession from "./captureSession.js";
import DeviceCapture from "./deviceCapture.js";

export default class CaptureManager {
    constructor() {
        this.events = createEmitter();
        this.session = null;
        this.deviceCapture = new DeviceCapture();
    }

    async initialize() {
        await this.deviceCapture.initialize();
    }

    async startDisplayCapture(constraints = {}) {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { frameRate: 60, ...constraints.video },
                audio: false,
            });
            return await this._startSession(stream, "display");
        } catch (error) {
            this.events.emit("error", formatError(error));
            throw error;
        }
    }

    async startDeviceCapture(deviceId) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: deviceId ? { exact: deviceId } : undefined },
                audio: false,
            });
            return await this._startSession(stream, "device");
        } catch (error) {
            this.events.emit("error", formatError(error));
            throw error;
        }
    }

    stop() {
        this.session?.stop();
        this.session = null;
        this.events.emit("stopped");
    }

    async _startSession(stream, type) {
        this.stop();
        this.session = new CaptureSession({ stream, type });
        this.session.events.on("frame", (frame) => this.events.emit("frame", frame));
        await this.session.start();
        this.events.emit("session", { type, stream });
        return this.session;
    }

    listDevices() {
        return this.deviceCapture.devices;
    }
}
