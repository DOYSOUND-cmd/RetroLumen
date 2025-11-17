export default class Texture {
    constructor(gl, { width = 1, height = 1, filter = gl.LINEAR, wrap = gl.CLAMP_TO_EDGE } = {}) {
        this.gl = gl;
        this.texture = gl.createTexture();
        this.width = width;
        this.height = height;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }

    bind(unit = 0) {
        this.gl.activeTexture(this.gl.TEXTURE0 + unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }

    updateFromSource(source) {
        const gl = this.gl;
        let width = source.width;
        let height = source.height;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        this.width = width;
        this.height = height;
    }

    dispose() {
        if(this.texture) {
            this.gl.deleteTexture(this.texture);
            this.texture = null;
        }
    }
}

