export function crossCompileGLSLToHLSL(glslSource) {
    // 簡易スタブ: 実際のSPIR-V変換は行わず、GLSLをそのまま返す。
    return {
        hlsl: `// HLSL (擬似変換)\n${glslSource}`,
        warnings: [],
    };
}

export default {
    crossCompileGLSLToHLSL,
};

