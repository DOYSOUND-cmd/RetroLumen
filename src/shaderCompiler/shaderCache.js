import sha256 from "./sha256.js";

export default class ShaderCache {
    constructor() {
        this.cache = new Map();
    }

    put(source) {
        const hash = sha256(source);
        this.cache.set(hash, source);
        return hash;
    }

    get(hash) {
        return this.cache.get(hash);
    }
}

