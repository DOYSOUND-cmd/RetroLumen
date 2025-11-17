import { createEmitter, PassthroughFragmentShader } from "./helpers.js";
import ShaderPass from "./shaderPass.js";
import Texture from "./texture.js";

export default class ShaderGlass {
    constructor({ canvas, events }) {
        this.canvas = canvas;
        this.events = events ?? createEmitter();
        this.gl = null;
        this.sourceTexture = null;
        this.passes = [];
        this.running = false;
        this.time = 0;
        this.hasPendingFrame = false;
        this.vao = null;
        this.vbo = null;
        this.devicePixelRatio = window.devicePixelRatio || 1;
    }

    async initialize() {
        this.gl = this.canvas.getContext("webgl2", {
            preserveDrawingBuffer: true,
            desynchronized: true,
        });
        if(!this.gl) {
            throw new Error("WebGL2 が利用できません。");
        }
        this._createGeometry();
        this.sourceTexture = new Texture(this.gl);
        this.setPreset({
            name: "Passthrough",
            passes: [
                {
                    fragmentSource: PassthroughFragmentShader,
                    offscreen: false,
                },
            ],
            params: [],
        });
        this.running = true;
        requestAnimationFrame((ts) => this._renderLoop(ts));
    }

    _createGeometry() {
        const gl = this.gl;
        const vertices = new Float32Array([
            -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1, 1,
        ]);
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
        gl.bindVertexArray(null);
    }

    setPreset(presetDefinition) {
        this.disposePasses();
        const passes = presetDefinition?.passes?.length ? presetDefinition.passes : [
            {
                fragmentSource: PassthroughFragmentShader,
                offscreen: false,
            },
        ];
        this.currentPreset = { ...presetDefinition, passes };
        this.passes = passes.map((passDef) => new ShaderPass(this.gl, passDef));
        this.resize(this.canvas.clientWidth, this.canvas.clientHeight, this.devicePixelRatio);
        this.events.emit("preset:changed", presetDefinition);
    }

    disposePasses() {
        this.passes.forEach((pass) => pass.dispose());
        this.passes = [];
    }

    resize(width, height, dpr = window.devicePixelRatio || 1) {
        this.devicePixelRatio = dpr;
        const pixelWidth = Math.max(1, Math.floor(width * dpr));
        const pixelHeight = Math.max(1, Math.floor(height * dpr));
        this.canvas.width = pixelWidth;
        this.canvas.height = pixelHeight;
        this.gl.viewport(0, 0, pixelWidth, pixelHeight);
        this.passes.forEach((pass) => pass.resize(pixelWidth, pixelHeight));
    }

    updateVideoFrame(videoElement) {
        if(!this.sourceTexture) return;
        this.sourceTexture.updateFromSource(videoElement);
        this.hasPendingFrame = true;
    }

    updateImage(bitmap) {
        if(!this.sourceTexture) return;
        this.sourceTexture.updateFromSource(bitmap);
        this.hasPendingFrame = true;
    }

    setParam(name, value) {
        this.passes.forEach((pass) => pass.setUniform(name, value));
    }

    _renderLoop(timestamp) {
        if(!this.running) return;
        if(this.hasPendingFrame) {
            this._draw(timestamp * 0.001);
            this.hasPendingFrame = false;
        }
        requestAnimationFrame((ts) => this._renderLoop(ts));
    }

    _draw(time) {
        if(!this.sourceTexture) return;
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        let sourceTexture = this.sourceTexture;
        this.passes.forEach((pass, index) => {
            const isLast = index === this.passes.length - 1;
            const result = pass.draw({
                sourceTexture,
                resolution: [this.canvas.width, this.canvas.height],
                time,
                isLastPass: isLast,
            });
            if(result) {
                sourceTexture = result;
            }
        });
        gl.bindVertexArray(null);
    }
}
