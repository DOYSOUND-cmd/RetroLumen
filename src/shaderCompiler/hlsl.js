export function translateHlslToGlsl(hlslSource) {
    const trimmed = hlslSource.trim();
    const bodyMatch = trimmed.match(/\{([\s\S]+)\}$/);
    const body = bodyMatch ? bodyMatch[1].trim() : "return float4(0,0,0,1);";
    let convertedBody = body
        .replace(/float4/g, "vec4")
        .replace(/float3/g, "vec3")
        .replace(/float2/g, "vec2")
        .replace(/float/g, "float")
        .replace(/tex2D\((\w+),\s*([\w\.]+)\)/g, "texture($1, $2)");
    convertedBody = convertedBody.replace(/return\s+vec4/gi, "fragColor = vec4");
    if(!convertedBody.includes("fragColor")) {
        convertedBody += "\nfragColor = vec4(0.0);";
    }
    return `#version 300 es
precision highp float;
in vec2 vTexCoord;
out vec4 fragColor;
uniform sampler2D uInput;
void main() {
    ${convertedBody}
}`;
}

export default {
    translateHlslToGlsl,
};

