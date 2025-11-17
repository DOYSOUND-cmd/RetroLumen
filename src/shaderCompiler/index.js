import { normalizeGLSL } from "./glsl.js";
import { translateHlslToGlsl } from "./hlsl.js";
import { crossCompileGLSLToHLSL } from "./spirv.js";
import ShaderCache from "./shaderCache.js";

export default class ShaderCompiler {
    constructor() {
        this.cache = new ShaderCache();
    }

    compileCustomPreset({ name, vertexSource, fragmentSource }) {
        const vertex = normalizeGLSL(vertexSource);
        const fragment = normalizeGLSL(fragmentSource);
        const cacheKey = this.cache.put(fragment);
        return {
            id: `custom-${cacheKey.slice(0, 12)}`,
            name,
            passes: [
                {
                    vertexSource: vertex,
                    fragmentSource: fragment,
                    offscreen: false,
                },
            ],
            params: [],
        };
    }

    translateHlslPreset({ name, hlslSource }) {
        const fragment = translateHlslToGlsl(hlslSource);
        return this.compileCustomPreset({ name, vertexSource: null, fragmentSource: fragment });
    }

    crossCompileToHlsl(glslSource) {
        return crossCompileGLSLToHLSL(glslSource);
    }
}

