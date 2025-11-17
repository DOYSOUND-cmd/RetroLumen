import { createElement, debounce } from "./helpers.js";

export default class BrowserWindow {
    constructor({ container, shaderList, events }) {
        this.container = container;
        this.shaderList = shaderList;
        this.events = events;
        this.query = "";
        this.container.innerHTML = "<h2>シェーダー</h2>";
        this._renderSearch();
        this.listElement = document.createElement("ul");
        this.listElement.style.listStyle = "none";
        this.listElement.style.padding = "0";
        this.listElement.style.margin = "0.5rem 0 0 0";
        this.container.appendChild(this.listElement);
        this._renderList();
    }

    _renderSearch() {
        const input = createElement("input", {
            type: "search",
            placeholder: "検索...",
        });
        input.addEventListener(
            "input",
            debounce(() => {
                this.query = input.value.toLowerCase();
                this._renderList();
            }, 100)
        );
        this.container.appendChild(input);
    }

    refresh() {
        this._renderList();
    }

    _renderList() {
        this.listElement.innerHTML = "";
        const presets = this.shaderList.getPresets().filter((preset) =>
            preset.name.toLowerCase().includes(this.query)
        );
        presets.forEach((preset) => {
            const item = document.createElement("li");
            item.style.marginBottom = "0.25rem";
            const button = createElement("button", {
                textContent: preset.name,
            });
            button.style.width = "100%";
            button.style.textAlign = "left";
            button.style.padding = "0.4rem";
            button.style.border = "1px solid rgba(255,255,255,0.2)";
            button.style.background = "rgba(255,255,255,0.05)";
            button.addEventListener("click", () => this.events.emit("preset:select", preset.id));
            item.appendChild(button);
            this.listElement.appendChild(item);
        });
        if(!presets.length) {
            this.listElement.appendChild(createElement("li", {}, ["該当なし"]));
        }
    }
}
