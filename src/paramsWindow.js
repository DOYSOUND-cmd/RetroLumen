import { createElement } from "./helpers.js";

export default class ParamsWindow {
    constructor({ container, events }) {
        this.container = container;
        this.events = events;
        this.currentPreset = null;
        this.inputs = new Map();
        this.container.innerHTML = "<h2>パラメータ</h2>";
    }

    setPreset(preset) {
        this.currentPreset = preset;
        this._render();
    }

    _render() {
        this.container.innerHTML = "<h2>パラメータ</h2>";
        this.inputs.clear();
        const params = this.currentPreset?.params ?? [];
        if(params.length === 0) {
            const fixedInfo = this.currentPreset?.fixedInfo ?? [];
            if(fixedInfo.length) {
                const list = document.createElement("ul");
                list.style.listStyle = "none";
                list.style.padding = "0";
                list.style.margin = "0";
                fixedInfo.forEach((info) => {
                    const item = createElement("li", {}, [`${info.label}: ${info.value}`]);
                    item.style.padding = "0.25rem 0";
                    list.appendChild(item);
                });
                this.container.appendChild(list);
            } else {
                this.container.appendChild(createElement("p", {}, ["利用可能なパラメータはありません。"]));
            }
            return;
        }
        params.forEach((param) => {
            const wrapper = createElement("div", { class: "param-row" });
            const label = createElement("label", { textContent: `${param.label ?? param.name}` });
            const valueLabel = createElement("span", { textContent: String(param.value ?? param.default ?? 0) });
            valueLabel.style.float = "right";
            const input = createElement("input", {
                type: "range",
                min: param.min ?? 0,
                max: param.max ?? 1,
                step: param.step ?? 0.01,
                value: param.value ?? param.default ?? 0,
            });
            input.addEventListener("input", () => {
                const value = parseFloat(input.value);
                valueLabel.textContent = value.toFixed(3);
                this.events.emit("params:change", { name: param.name, value });
            });
            wrapper.appendChild(label);
            wrapper.appendChild(valueLabel);
            wrapper.appendChild(input);
            this.container.appendChild(wrapper);
            this.inputs.set(param.name, input);
        });
    }
}
