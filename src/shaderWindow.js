export default class ShaderWindow {
    constructor({ canvas, shaderGlass, cursorEmulator }) {
        this.canvas = canvas;
        this.shaderGlass = shaderGlass;
        this.cursorEmulator = cursorEmulator;
        this.resizeObserver = new ResizeObserver(() => this._resize());
        this.pointerActive = false;
    }

    initialize() {
        this._resize();
        this.resizeObserver.observe(this.canvas);
        this.canvas.addEventListener("pointermove", (event) => this._onPointerMove(event));
        this.canvas.addEventListener("pointerenter", () => this._setPointer(true));
        this.canvas.addEventListener("pointerleave", () => this._setPointer(false));
    }

    _resize() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.shaderGlass.resize(rect.width, rect.height, dpr);
    }

    _setPointer(active) {
        this.pointerActive = active;
        this.cursorEmulator.setVisible(active);
    }

    _onPointerMove(event) {
        if(!this.pointerActive) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.cursorEmulator.updatePosition(x, y);
    }
}

