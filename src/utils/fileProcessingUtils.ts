export function isNumberList(value: string): boolean {
    const parts = value.split(",");
    return parts.every(part => !isNaN(Number(part.trim())));
}

export function isNumber(value: string): boolean {
    return !isNaN(Number(value));
}

export function generateCustomSchema() {

    throw new Error("not implemented.");
}
