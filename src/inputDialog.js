export default class InputDialog {
    constructor() {
        this.dialog = document.createElement("dialog");
        this.dialog.style.minWidth = "320px";
        this.dialog.innerHTML = "<form method='dialog'><label></label><input type='text' /><menu><button value='cancel'>キャンセル</button><button value='ok'>OK</button></menu></form>";
        document.body.appendChild(this.dialog);
        this.form = this.dialog.querySelector("form");
        this.label = this.form.querySelector("label");
        this.input = this.form.querySelector("input");
    }

    async prompt({ title, defaultValue = "" }) {
        this.label.textContent = title;
        this.input.value = defaultValue;
        return new Promise((resolve) => {
            const handler = (event) => {
                event.preventDefault();
                this.dialog.close(this.form.returnValue);
            };
            this.form.addEventListener("submit", handler, { once: true });
            this.dialog.addEventListener(
                "close",
                () => {
                    resolve(this.dialog.returnValue === "ok" ? this.input.value : null);
                },
                { once: true }
            );
            this.dialog.showModal();
            this.input.focus();
        });
    }
}

