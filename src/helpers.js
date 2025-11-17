const uidSeed = { value: 0 };

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function degToRad(deg) {
    return (deg * Math.PI) / 180;
}

export function nextId(prefix = "id") {
    uidSeed.value += 1;
    return `${prefix}-${uidSeed.value.toString(36)}`;
}

export function raf() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
}

export function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createEmitter() {
    const listeners = new Map();
    return {
        on(event, handler) {
            if(!listeners.has(event)) {
                listeners.set(event, new Set());
            }
            listeners.get(event).add(handler);
            return () => this.off(event, handler);
        },
        off(event, handler) {
            listeners.get(event)?.delete(handler);
        },
        emit(event, payload) {
            listeners.get(event)?.forEach((handler) => handler(payload));
        },
        clear() {
            listeners.clear();
        },
    };
}

export function createElement(tag, props = {}, children = []) {
    const element = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
        if(value === undefined || value === null) return;
        if(key === "class") {
            element.className = value;
        } else if(key.startsWith("on") && typeof value === "function") {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else if(key in element) {
            element[key] = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    children.forEach((child) => {
        if(typeof child === "string") {
            element.appendChild(document.createTextNode(child));
        } else if(child) {
            element.appendChild(child);
        }
    });
    return element;
}

export function formatError(error) {
    if(typeof error === "string") {
        return error;
    }
    if(error instanceof Error) {
        return error.message;
    }
    try {
        return JSON.stringify(error);
    } catch {
        return String(error);
    }
}

export function debounce(fn, waitMs) {
    let handle;
    return (...args) => {
        clearTimeout(handle);
        handle = setTimeout(() => fn(...args), waitMs);
    };
}

export function throttle(fn, waitMs) {
    let last = 0;
    let scheduled = null;
    return (...args) => {
        const now = performance.now();
        const remaining = waitMs - (now - last);
        if(remaining <= 0) {
            last = now;
            fn(...args);
        } else if(!scheduled) {
            scheduled = setTimeout(() => {
                last = performance.now();
                scheduled = null;
                fn(...args);
            }, remaining);
        }
    };
}

export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export async function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

export async function readFileAsImageBitmap(file) {
    return createImageBitmap(file);
}

export function createWorkerUrl(source) {
    const blob = new Blob([source], { type: "application/javascript" });
    return URL.createObjectURL(blob);
}

export function invariant(condition, message) {
    if(!condition) {
        throw new Error(message);
    }
}

export const DefaultVertexShader = `#version 300 es
precision highp float;

layout (location = 0) in vec2 position;
layout (location = 1) in vec2 uv;

out vec2 vTexCoord;

void main() {
    vTexCoord = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}`;

export const PassthroughFragmentShader = `#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 fragColor;
uniform sampler2D uInput;

void main() {
    fragColor = texture(uInput, vTexCoord);
}`;

