import { createElement, formatError } from "./helpers.js";
import ShaderCompiler from "./shaderCompiler/index.js";

export default class CompileWindow {
    constructor({ container, events }) {
        this.container = container;
        this.events = events;
        this.compiler = new ShaderCompiler();
        this._buildUI();
    }

    _buildUI() {
        this.container.innerHTML = "<h2>コンパイル</h2>";
        this.nameInput = createElement("input", {
            type: "text",
            placeholder: "プリセット名",
            value: "カスタムプリセット",
        });
        this.vertexInput = createElement("textarea", {
            value: `#version 300 es
precision highp float;
layout(location=0) in vec2 position;
layout(location=1) in vec2 uv;
out vec2 vTexCoord;
void main() {
    vTexCoord = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}
`,
        });
        this.fragmentInput = createElement("textarea", {
            value: `#version 300 es
precision highp float;
in vec2 vTexCoord;
uniform sampler2D uInput;
uniform float uTime;
out vec4 fragColor;
void main() {
    vec2 uv = vTexCoord;
    float warp = sin(uTime + uv.y * 20.0) * 0.002;
    vec3 color = texture(uInput, vec2(uv.x + warp, uv.y)).rgb;
    fragColor = vec4(color, 1.0);
}
`,
        });
        const compileButton = createElement("button", { textContent: "コンパイル" });
        const status = createElement("p", { textContent: "" });
        compileButton.addEventListener("click", () => this._compile(status));
        this.container.appendChild(this.nameInput);
        this.container.appendChild(this.vertexInput);
        this.container.appendChild(this.fragmentInput);
        this.container.appendChild(compileButton);
        this.container.appendChild(status);
    }

    _compile(statusElement) {
        try {
            const preset = this.compiler.compileCustomPreset({
                name: this.nameInput.value || "Custom",
                vertexSource: this.vertexInput.value,
                fragmentSource: this.fragmentInput.value,
            });
            this.events.emit("preset:compiled", preset);
            statusElement.textContent = "成功: 新しいプリセットを適用しました。";
        } catch (error) {
            statusElement.textContent = `エラー: ${formatError(error)}`;
        }
    }
}

