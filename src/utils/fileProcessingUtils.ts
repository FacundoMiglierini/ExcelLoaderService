import { SchemaTypes } from "mongoose";
import { DataTypes, SchemaDataTypes } from "../enums/DataTypes";

export function mapToMongooseSchema(definition: { [key: string]: { type: SchemaDataTypes; required?: boolean } }) {

    const typeMap: { [key in SchemaDataTypes]: any } = {
        [SchemaDataTypes.STRING]: SchemaTypes.String,
        [SchemaDataTypes.NUMBER]: SchemaTypes.Number,
        [SchemaDataTypes.ARRAY]: [SchemaTypes.Number],
    };

    const schemaDefinition: { [key: string]: any } = {};

    for (const [key, value] of Object.entries(definition)) {
        schemaDefinition[key] = {
            type: typeMap[value.type],
            required: value.required || false,
        };
    }

    return schemaDefinition;
}

export function isNumberList(value: string): boolean {
    const parts = value.split(",");
    return parts.every(part => !isNaN(Number(part.trim())));
}

export function isNumber(value: string): boolean {
    return !isNaN(Number(value));
}

export function schemaAsList(schema: { [key: string] : { type: string, required: boolean } }) {
    return Object.keys(schema).map(key => {
        const type = schema[key].type; 
        const required = schema[key].required;

        return {
          column: key,
          required,
          type
        };
    });
}

export function schemaAsDict(format: { [key: string]: string }) {

    try {
        const processedSchema: { [key: string]: { type: any, required: boolean } } = {};

        Object.entries(format).forEach(([key, value]) => {
            if (typeof key !== "string") {
                const error = new Error("Incompatible file schema: column names must be strings.")
                error.name = "BadRequestError";
                throw error;
            }

            const isRequired = !key.toString().endsWith("?");
            const columnName = isRequired ? key.toString() : key.toString().slice(0, -1);
            var dataType: any = '';            
            switch (value.toLowerCase()) {
                case DataTypes.STRING:
                    dataType = SchemaDataTypes.STRING;
                    break;
                case DataTypes.NUMBER:
                    dataType = SchemaDataTypes.NUMBER;
                    break;
                case DataTypes.ARRAY:
                    dataType = SchemaDataTypes.ARRAY;
                    break;
                default:
                    const error: Error = new Error("Incompatible file schema: incorrect data type.");
                    error.name = "BadRequestError";
                    throw error;
            }

            processedSchema[columnName] = {
                type: dataType,
                required: isRequired
            }
        });

        return processedSchema;
    } catch (error) {
        console.error(error);
    }
}

// Helper function to check if the cell is invalid based on required flag
export function isCellInvalid(cell: any, required: boolean): boolean {
    return (cell === null || cell === '' || cell === 'undefined') && required;
}

// Helper function to format the cell based on its type
export function formatCell(cell: any, type: string): any {
    if (cell === null) return null;

    switch (type) {
        case SchemaDataTypes.STRING:
            return formatString(cell);
        case SchemaDataTypes.NUMBER:
            return formatNumber(cell);
        case SchemaDataTypes.ARRAY:
            return formatArray(cell);
        default:
            return undefined;
    }
}

// Helper function to format a string cell
export function formatString(cell: any): string {
    if (isNumber(cell) || isNumberList(cell)) {
        throw new Error(`Cannot convert '${cell}' to a String: it is a Number or Array<Number>.`);
    }
    return cell.toString();
}

// Helper function to format a number cell
export function formatNumber(cell: any): number {
    if (!isNumber(cell)) {
        throw new Error(`Cannot convert '${cell}' to a Number.`);
    }
    return Number(cell);
}

// Helper function to format an array cell
export function formatArray(cell: any): number[] {
    if (!isNumberList(cell.toString())) {
        throw new Error(`Cannot convert '${cell}' to an Array<Number>.`);
    }
    return cell.toString().split(',')
        .filter((val: string) => val.trim() !== '')
        .map(Number)
        .sort((a: number, b: number) => a - b);
}
