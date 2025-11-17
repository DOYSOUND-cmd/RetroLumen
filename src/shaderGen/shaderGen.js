import { nextId } from "../helpers.js";

export function parsePresetText(text) {
    try {
        return JSON.parse(text);
    } catch (error) {
        // 簡易INI風フォーマットをサポート
        const lines = text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length && !line.startsWith("#"));
        const preset = { name: "Imported", passes: [], params: [] };
        let currentPass = null;
        lines.forEach((line) => {
            if(line.startsWith("[pass")) {
                if(currentPass) preset.passes.push(currentPass);
                currentPass = { fragmentSource: "", uniforms: {} };
            } else if(line.startsWith("name=")) {
                preset.name = line.slice(5);
            } else if(line.startsWith("fragment=")) {
                if(!currentPass) currentPass = { fragmentSource: "", uniforms: {} };
                currentPass.fragmentSource += `${line.slice(9)}\n`;
            }
        });
        if(currentPass) preset.passes.push(currentPass);
        return preset;
    }
}

export default class ShaderGen {
    constructor() {
        this.imports = [];
    }

    importPreset(text) {
        const data = parsePresetText(text);
        return {
            id: data.id ?? nextId("preset"),
            name: data.name ?? "Imported",
            passes: data.passes ?? [],
            params: data.params ?? [],
        };
    }
}

