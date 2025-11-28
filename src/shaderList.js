import Preset from "./preset.js";
import { PassthroughFragmentShader } from "./helpers.js";

const DEFAULT_PRESETS = [
    {
        id: "passthrough",
        name: "パススルー",
        passes: [
            {
                fragmentSource: PassthroughFragmentShader,
                offscreen: false,
            },
        ],
        params: [],
        fixedInfo: [],
    },
    {
        id: "crt-scanline",
        name: "CRT Scanline",
        passes: [
            {
                fragmentSource: `#version 300 es
precision highp float;
in vec2 vTexCoord;
uniform sampler2D uInput;
uniform vec2 uResolution;
uniform float uScanlineIntensity;
uniform float uCurvature;
out vec4 fragColor;
void main() {
    vec2 uv = vTexCoord;
    vec2 centered = uv - 0.5;
    float radius = dot(centered, centered);
    uv = 0.5 + centered * (1.0 + uCurvature * radius);
    vec3 color = texture(uInput, uv).rgb;
    float scan = sin(uv.y * uResolution.y * 0.5) * 0.5 + 0.5;
    color *= mix(1.0, scan, uScanlineIntensity);
    fragColor = vec4(color, 1.0);
}`,
                uniforms: {
                    uScanlineIntensity: 0.10,
                    uCurvature: 0.18,
                },
            },
        ],
        params: [],
        fixedInfo: [
            { label: "スキャンライン", value: "0.10" },
            { label: "湾曲", value: "0.18" },
        ],
    },
    {
        id: "analog-glow",
        name: "アナロググロー",
        passes: [
            {
                fragmentSource: `#version 300 es
precision highp float;
in vec2 vTexCoord;
uniform sampler2D uInput;
uniform float uGlow;
out vec4 fragColor;
void main() {
    vec2 uv = vTexCoord;
    vec3 color = texture(uInput, uv).rgb;
    vec3 bloom = (
        texture(uInput, uv + vec2(0.002, 0.0)).rgb +
        texture(uInput, uv - vec2(0.002, 0.0)).rgb +
        texture(uInput, uv + vec2(0.0, 0.002)).rgb +
        texture(uInput, uv - vec2(0.0, 0.002)).rgb
    ) * 0.25;
    color = mix(color, bloom, uGlow);
    fragColor = vec4(color, 1.0);
}`,
                uniforms: {
                    uGlow: 0.31,
                },
            },
        ],
        params: [],
        fixedInfo: [
            { label: "グロー", value: "0.31" },
        ],
    },
];

export default class ShaderList {
    constructor() {
        this.presets = new Map();
        DEFAULT_PRESETS.forEach((preset) => this.register(preset));
    }

    register(definition) {
        const preset = new Preset(definition);
        this.presets.set(preset.id, preset);
    }

    upsert(definition) {
        const preset = new Preset(definition);
        this.presets.set(preset.id, preset);
        return preset;
    }

    getPresets() {
        return Array.from(this.presets.values());
    }

    find(id) {
        return this.presets.get(id);
    }
}
