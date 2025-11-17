import { clamp } from "./helpers.js";

export default class CropDialog {
    constructor(events) {
        this.events = events;
        this.dialog = document.createElement("dialog");
        this.dialog.style.minWidth = "280px";
        this.inputs = ["x", "y", "width", "height"].reduce((map, key) => {
            const wrapper = document.createElement("label");
            wrapper.textContent = key;
            wrapper.style.display = "block";
            const input = document.createElement("input");
            input.type = "number";
            input.min = 0;
            input.max = key === "width" || key === "height" ? 1 : 10000;
            input.step = 0.01;
            wrapper.appendChild(input);
            this.dialog.appendChild(wrapper);
            map[key] = input;
            return map;
        }, {});
        const buttons = document.createElement("menu");
        buttons.style.display = "flex";
        buttons.style.justifyContent = "flex-end";
        const cancel = document.createElement("button");
        cancel.textContent = "キャンセル";
        cancel.addEventListener("click", () => this.dialog.close());
        const apply = document.createElement("button");
        apply.textContent = "適用";
        apply.addEventListener("click", () => this._apply());
        buttons.appendChild(cancel);
        buttons.appendChild(apply);
        this.dialog.appendChild(buttons);
        document.body.appendChild(this.dialog);
    }

    open(rect) {
        this.inputs.x.value = rect?.x ?? 0;
        this.inputs.y.value = rect?.y ?? 0;
        this.inputs.width.value = rect?.width ?? 1;
        this.inputs.height.value = rect?.height ?? 1;
        this.dialog.showModal();
    }

    _apply() {
        const rect = {
            x: clamp(parseFloat(this.inputs.x.value), 0, 10000),
            y: clamp(parseFloat(this.inputs.y.value), 0, 10000),
            width: clamp(parseFloat(this.inputs.width.value), 0.01, 1),
            height: clamp(parseFloat(this.inputs.height.value), 0.01, 1),
        };
        this.events.emit("crop:apply", rect);
        this.dialog.close();
    }
}

