type Meta = { code: number, response: any };

export class AvanzaError extends Error {
    meta?: Meta
    constructor(message: string, meta?: Meta) {
        super(message);
        this.meta = meta;
        this.name = "AvanzaError";
    }
}