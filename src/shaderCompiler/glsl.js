export function normalizeGLSL(source) {
    const trimmed = source.trim();
    const withVersion = trimmed.includes("#version") ? trimmed : `#version 300 es\n${trimmed}`;
    if(!/void\s+main\s*\(/.test(withVersion)) {
        throw new Error("GLSL: main 関数が見つかりません。");
    }
    return withVersion;
}

export function validateUniforms(source, uniforms = []) {
    uniforms.forEach((uniform) => {
        if(!source.includes(uniform)) {
            console.warn(`警告: uniform ${uniform} がソースに見つかりません。`);
        }
    });
}

export default {
    normalizeGLSL,
    validateUniforms,
};

