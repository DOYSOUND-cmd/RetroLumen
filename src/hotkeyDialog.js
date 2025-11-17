import { createElement } from "./helpers.js";

export default class HotkeyDialog {
    constructor(events) {
        this.events = events;
        this.hotkeys = new Map([["startCapture", "KeyG"]]);
        this.labels = {
            startCapture: "画面キャプチャ開始",
        };
        this._installListeners();
        this._buildDialog();
    }

    _installListeners() {
        window.addEventListener("keydown", (event) => {
            for(const [action, key] of this.hotkeys.entries()) {
                if(event.code === key) {
                    this.events.emit(`hotkey:${action}`);
                    event.preventDefault();
                    break;
                }
            }
        });
    }

    _buildDialog() {
        this.dialog = document.createElement("dialog");
        this.dialog.style.minWidth = "360px";
        this.dialog.appendChild(createElement("h3", { textContent: "ホットキー" }));
        this._renderTable();
        const closeButton = createElement("button", { textContent: "閉じる" });
        closeButton.addEventListener("click", () => this.dialog.close());
        this.dialog.appendChild(closeButton);
        document.body.appendChild(this.dialog);
    }

    _renderTable() {
        const table = document.createElement("table");
        table.style.width = "100%";
        this.hotkeys.forEach((key, action) => {
            const row = document.createElement("tr");
            const label = document.createElement("td");
            label.textContent = this.labels[action] ?? action;
            const keyCell = document.createElement("td");
            keyCell.textContent = key;
            keyCell.style.textAlign = "right";
            keyCell.style.cursor = "pointer";
            keyCell.addEventListener("click", () => this._captureKey(action, keyCell));
            row.appendChild(label);
            row.appendChild(keyCell);
            table.appendChild(row);
        });
        this.dialog.appendChild(table);
    }

    _captureKey(action, cell) {
        cell.textContent = "Press...";
        const handler = (event) => {
            this.hotkeys.set(action, event.code);
            cell.textContent = event.code;
            window.removeEventListener("keydown", handler, true);
            event.preventDefault();
        };
        window.addEventListener("keydown", handler, true);
    }

    show() {
        this.dialog.showModal();
    }
}

