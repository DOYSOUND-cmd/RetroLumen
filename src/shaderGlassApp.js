import { createEmitter } from "./helpers.js";
import CaptureManager from "./captureManager.js";
import ShaderGlass from "./shaderGlass.js";
import ShaderWindow from "./shaderWindow.js";
import CursorEmulator from "./cursorEmulator.js";
import ShaderList from "./shaderList.js";

export default class ShaderGlassApp {
    constructor({ canvas, cursorLayer, buttons, rootElement }) {
        this.canvas = canvas;
        this.cursorLayer = cursorLayer;
        this.buttons = buttons;
        this.rootElement = rootElement ?? document.body;
        this.events = createEmitter();
        this.captureManager = new CaptureManager();
        this.shaderList = new ShaderList();
        this.cursorEmulator = new CursorEmulator(cursorLayer);
        this.activePreset = null;
        this._setCaptureState(false);
    }

    async initialize() {
        await this.captureManager.initialize();
        this.shaderGlass = new ShaderGlass({ canvas: this.canvas, events: this.events });
        await this.shaderGlass.initialize();

        this.shaderWindow = new ShaderWindow({
            canvas: this.canvas,
            shaderGlass: this.shaderGlass,
            cursorEmulator: this.cursorEmulator,
        });
        this.shaderWindow.initialize();

        this._installEventHandlers();
        this._installButtons();

        const defaultPreset =
            this.shaderList.find("crt-scanline") ?? this.shaderList.getPresets()[0];
        this.applyPreset(defaultPreset);
    }

    _installEventHandlers() {
        this.captureManager.events.on("frame", ({ video }) => {
            this.shaderGlass.updateVideoFrame(video);
        });
        this.captureManager.events.on("error", (message) => {
            console.error(message);
        });
        this.captureManager.events.on("session", () => this._setCaptureState(true));
        this.captureManager.events.on("stopped", () => this._setCaptureState(false));
    }

    _installButtons() {
        this.buttons.startCapture.addEventListener("click", () => this.startDisplayCapture());
        this.buttons.stopCapture.addEventListener("click", () => this.captureManager.stop());
    }

    async startDisplayCapture() {
        await this.captureManager.startDisplayCapture();
    }

    applyPreset(preset) {
        if(!preset) return;
        this.activePreset = preset;
        this.shaderGlass.setPreset({
            name: preset.name,
            passes: preset.passes,
            params: preset.params,
        });
        preset.params.forEach((param) => {
            const value = param.value ?? param.default ?? 0;
            this.shaderGlass.setParam(param.name, value);
        });
    }

    _setCaptureState(active) {
        if(!this.rootElement) return;
        this.rootElement.classList.toggle("pre-capture", !active);
    }
}
