export default class DeviceCapture {
    constructor() {
        this.devices = [];
        this._onDeviceChange = this._onDeviceChange.bind(this);
    }

    async initialize() {
        if(!navigator.mediaDevices?.enumerateDevices) {
            this.devices = [];
            return;
        }
        await this._refreshDevices();
        navigator.mediaDevices.addEventListener("devicechange", this._onDeviceChange);
    }

    async _refreshDevices() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.devices = devices
            .filter((device) => device.kind === "videoinput")
            .map((device) => ({
                id: device.deviceId,
                label: device.label || "カメラ",
            }));
    }

    async _onDeviceChange() {
        await this._refreshDevices();
    }

    dispose() {
        navigator.mediaDevices?.removeEventListener("devicechange", this._onDeviceChange);
    }
}

