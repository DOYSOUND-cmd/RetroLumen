import ShaderGlassApp from "./shaderGlassApp.js";

const domReady = () =>
    new Promise((resolve) => {
        if(document.readyState === "complete" || document.readyState === "interactive") {
            resolve();
        } else {
            document.addEventListener("DOMContentLoaded", resolve, { once: true });
        }
    });

await domReady();

const canvas = document.getElementById("shader-canvas");
const cursorLayer = document.getElementById("cursor-layer");
const btnStart = document.getElementById("btn-start-capture");
const btnStop = document.getElementById("btn-stop-capture");
const rootElement = document.body;

const app = new ShaderGlassApp({
    rootElement,
    canvas,
    cursorLayer,
    buttons: {
        startCapture: btnStart,
        stopCapture: btnStop,
    },
});

app.initialize().catch((error) => {
    console.error("ShaderGlassApp initialize error", error);
});
