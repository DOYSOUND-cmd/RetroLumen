import Shader from "./shader.js";
import Texture from "./texture.js";
import { DefaultVertexShader } from "./helpers.js";

export default class ShaderPass {
    constructor(gl, definition) {
        this.gl = gl;
        this.definition = definition;
        this.shader = new Shader(gl, definition.vertexSource ?? DefaultVertexShader, definition.fragmentSource);
        this.uniformValues = new Map(Object.entries(definition.uniforms ?? {}));
        this.target = null;
        if(definition.offscreen !== false) {
            this.target = {
                framebuffer: gl.createFramebuffer(),
                texture: new Texture(gl),
            };
        }
    }

    resize(width, height) {
        if(!this.target) return;
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.target.framebuffer);
        this.target.texture.dispose();
        this.target.texture = new Texture(this.gl, { width, height });
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT0,
            this.gl.TEXTURE_2D,
            this.target.texture.texture,
            0
        );
    }

    setUniform(name, value) {
        this.uniformValues.set(name, value);
    }

    applyUniforms() {
        for(const [name, value] of this.uniformValues.entries()) {
            this.shader.setUniform(name, value);
        }
    }

    draw({ sourceTexture, resolution, time, isLastPass }) {
        const gl = this.gl;
        this.shader.use();
        this.applyUniforms();
        this.shader.setUniform("uResolution", resolution);
        this.shader.setUniform("uTime", time);
        sourceTexture.bind(0);
        this.shader.setUniformInt("uInput", 0);
        if(isLastPass || !this.target) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            return null;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.target.framebuffer);
        gl.viewport(0, 0, this.target.texture.width, this.target.texture.height);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this.target.texture.texture,
            0
        );
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        return this.target.texture;
    }

    dispose() {
        this.shader.dispose();
        if(this.target) {
            this.gl.deleteFramebuffer(this.target.framebuffer);
            this.target.texture.dispose();
        }
    }
}

