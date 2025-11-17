export default class Preset {
    constructor(definition) {
        this.definition = {
            id: definition.id,
            name: definition.name,
            passes: definition.passes ?? [],
            params: (definition.params ?? []).map((param) => ({
                ...param,
                value: param.default ?? param.value ?? 0,
            })),
            fixedInfo: definition.fixedInfo ?? [],
        };
    }

    get id() {
        return this.definition.id;
    }

    get name() {
        return this.definition.name;
    }

    get passes() {
        return this.definition.passes;
    }

    get params() {
        return this.definition.params;
    }

    get fixedInfo() {
        return this.definition.fixedInfo;
    }
}
