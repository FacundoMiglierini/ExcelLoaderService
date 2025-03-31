import { SchemaTypes } from "mongoose";
import { DataTypes, SchemaDataTypes } from "../enums/DataTypes";

// Maps a given schema definition to a Mongoose schema format.
// It takes a definition object with the field names and their respective types,
// and returns a schema object compatible with Mongoose.
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

// Checks if a given value is a list of numbers separated by commas.
// It returns true if all elements in the list can be parsed as numbers.
export function isNumberList(value: string): boolean {
    const parts = value.split(",");
    return parts.every(part => !isNaN(Number(part.trim())));
}

// Checks if a given value is a valid number.
// It returns true if the value can be parsed as a number.
export function isNumber(value: string): boolean {
    return !isNaN(Number(value));
}

// Converts a schema definition (in object format) to an array of columns
// where each column is an object containing the column name, type, and required flag.
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

// Converts a given schema format (in a dictionary) into a processed schema
// that assigns types and required flags to each column, while handling error cases for incompatible data types.
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

// Checks if a given cell is invalid based on whether it's required and empty.
// It returns true if the cell is either null, empty, or undefined and is required.
export function isCellInvalid(cell: any, required: boolean): boolean {
    return (cell === null || cell === '' || cell === 'undefined') && required;
}

// Formats a cell based on its expected type (string, number, or array).
// It throws an error if the cell value doesn't match the expected type.
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

// Helper function to format a cell as a string
// If the cell value is a number or an array of numbers, it throws an error.
export function formatString(cell: any): string {
    if (isNumber(cell) || isNumberList(cell)) {
        throw new Error(`Cannot convert '${cell}' to a String: it is a Number or Array<Number>.`);
    }
    return cell.toString();
}

// Helper function to format a cell as a number.
// If the cell value cannot be converted to a number, it throws an error.
export function formatNumber(cell: any): number {
    if (!isNumber(cell)) {
        throw new Error(`Cannot convert '${cell}' to a Number.`);
    }
    return Number(cell);
}

// Helper function to format a cell as an array of numbers.
// If the cell value cannot be converted to an array of numbers, it throws an error.
export function formatArray(cell: any): number[] {
    if (!isNumberList(cell.toString())) {
        throw new Error(`Cannot convert '${cell}' to an Array<Number>.`);
    }
    return cell.toString().split(',')
        .filter((val: string) => val.trim() !== '')
        .map(Number)
        .sort((a: number, b: number) => a - b);
}
