import { clamp } from "./helpers.js";

export default class CursorEmulator {
    constructor(layer) {
        this.layer = layer;
        this.cursor = document.createElement("div");
        this.cursor.style.position = "absolute";
        this.cursor.style.width = "16px";
        this.cursor.style.height = "16px";
        this.cursor.style.borderRadius = "50%";
        this.cursor.style.border = "2px solid #fff";
        this.cursor.style.boxShadow = "0 0 6px rgba(0,0,0,0.5)";
        this.cursor.style.pointerEvents = "none";
        this.cursor.style.transform = "translate(-50%, -50%)";
        this.cursor.style.display = "none";
        this.layer.appendChild(this.cursor);
        this.visible = false;
    }

    setVisible(visible) {
        this.visible = visible;
        this.cursor.style.display = visible ? "block" : "none";
    }

    updatePosition(x, y) {
        if(!this.visible) return;
        const bounds = this.layer.getBoundingClientRect();
        const clampedX = clamp(x, 0, bounds.width);
        const clampedY = clamp(y, 0, bounds.height);
        this.cursor.style.left = `${clampedX}px`;
        this.cursor.style.top = `${clampedY}px`;
    }

    setColour(color) {
        this.cursor.style.borderColor = color;
    }
}

