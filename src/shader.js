import { formatError } from "./helpers.js";

export default class Shader {
    constructor(gl, vertexSource, fragmentSource) {
        this.gl = gl;
        this.vertexSource = vertexSource;
        this.fragmentSource = fragmentSource;
        this.program = this._createProgram(vertexSource, fragmentSource);
        this.uniformLocations = new Map();
        this.attribLocations = new Map();
    }

    _compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const log = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error(`WebGL shader compile error: ${formatError(log)}`);
        }
        return shader;
    }

    _createProgram(vertexSource, fragmentSource) {
        const program = this.gl.createProgram();
        const vs = this._compileShader(this.gl.VERTEX_SHADER, vertexSource);
        const fs = this._compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);
        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);
        this.gl.linkProgram(program);
        this.gl.deleteShader(vs);
        this.gl.deleteShader(fs);
        if(!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const log = this.gl.getProgramInfoLog(program);
            this.gl.deleteProgram(program);
            throw new Error(`WebGL program link error: ${formatError(log)}`);
        }
        return program;
    }

    use() {
        this.gl.useProgram(this.program);
    }

    getUniformLocation(name) {
        if(!this.uniformLocations.has(name)) {
            this.uniformLocations.set(name, this.gl.getUniformLocation(this.program, name));
        }
        return this.uniformLocations.get(name);
    }

    setUniform(name, value) {
        const location = this.getUniformLocation(name);
        if(location === null || location === undefined) return;
        if(typeof value === "number") {
            this.gl.uniform1f(location, value);
        } else if(Array.isArray(value)) {
            switch(value.length) {
                case 1:
                    this.gl.uniform1f(location, value[0]);
                    break;
                case 2:
                    this.gl.uniform2f(location, value[0], value[1]);
                    break;
                case 3:
                    this.gl.uniform3f(location, value[0], value[1], value[2]);
                    break;
                case 4:
                    this.gl.uniform4f(location, value[0], value[1], value[2], value[3]);
                    break;
                default:
                    break;
            }
        } else if(value instanceof Float32Array) {
            const len = value.length;
            if(len === 9) {
                this.gl.uniformMatrix3fv(location, false, value);
            } else if(len === 16) {
                this.gl.uniformMatrix4fv(location, false, value);
            }
        } else if(typeof value === "object" && value && value.type === "int") {
            this.gl.uniform1i(location, value.value);
        }
    }

    setUniformInt(name, value) {
        const location = this.getUniformLocation(name);
        if(location === null || location === undefined) return;
        this.gl.uniform1i(location, value);
    }

    dispose() {
        if(this.program) {
            this.gl.deleteProgram(this.program);
            this.program = null;
        }
    }
}
