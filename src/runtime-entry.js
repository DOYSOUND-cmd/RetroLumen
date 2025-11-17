import ShaderGlass from "./shaderGlass.js";
import ShaderList from "./shaderList.js";

const runtime = {
    ShaderGlass,
    ShaderList,
};

if(typeof window !== "undefined") {
    window.ShaderRuntime = runtime;
    if(Array.isArray(window.__shaderRuntimeReadyQueue)) {
        const queue = window.__shaderRuntimeReadyQueue.splice(0);
        queue.forEach((resolve) => {
            try {
                resolve(runtime);
            } catch (error) {
                console.error("ShaderRuntime ready listener error", error);
            }
        });
    }
    let readyEvent;
    if(typeof window.CustomEvent === "function") {
        readyEvent = new CustomEvent("ShaderRuntimeReady");
    } else if(typeof document !== "undefined" && document.createEvent) {
        readyEvent = document.createEvent("Event");
        readyEvent.initEvent("ShaderRuntimeReady", false, false);
    }
    if(readyEvent) {
        window.dispatchEvent(readyEvent);
    }
} else if(typeof globalThis !== "undefined") {
    globalThis.ShaderRuntime = runtime;
}
