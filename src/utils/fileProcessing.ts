import { FileModel } from "../entities/File";
import { Job } from "../interfaces/IJob";
import { File } from "../interfaces/IFile";
import DataTypes from "../enums/DataTypes";


function isNumberList(value: string): boolean {
  const parts = value.split(",");
  return parts.every(part => !isNaN(Number(part.trim())));
}

function isNumber(value: string): boolean {
  return !isNaN(Number(value));
}

function processFile (job: Job) {

    const format = job.schema 
    const raw_data = job.raw_data

    const processedSchema: { column: string, nullable: boolean, dataType: string }[] = []

    // Validate schema
    Object.entries(format).forEach(([key, value]) => {
        if (typeof key !== "string") 
            throw new Error("Incompatible file schema: column names must be strings.")

        // Normalización del nombre de columna
        const isNullable = key.toString().endsWith("?");
        const columnName = isNullable ? key.toString().slice(0, -1) : key.toString();
        // Extracción del tipo de dato
        const dataType = value.toLowerCase();

        processedSchema.push({
            column: columnName,
            nullable: isNullable,
            dataType: dataType,
        })
    });

    const processedFile: typeof processedSchema[] = []
    const totalErrors: { row: number; col: number}[] = []

    raw_data.slice(1).forEach((row: any, rowIndex: number) => {

        const newRow: any = {}
        const rowErrors: { row: number; col: number}[] = []
        
        row.forEach((cell: any, colIndex: number) => {
            try {
                if (cell === null && !processedSchema[colIndex]["nullable"]) {
                    throw new Error("Null cell within not nullable column.") 
                } else {
                    var formattedCell;
                    if (cell === null) {
                        return;
                    } else {
                        switch (processedSchema[colIndex]["dataType"]) {
                            case DataTypes.STRING:
                                if (isNumber(cell) || isNumberList(cell)) {
                                    throw new Error(`Cannot convert '${cell}' to a String: it is a Number or Array<Number>.`);
                                }
                                formattedCell = cell.toString();
                                break;
                            case DataTypes.NUMBER:
                                if (!isNumber(cell)) {
                                    throw new Error(`Cannot convert '${cell}' to a Number.`);
                                }
                                formattedCell = Number(cell);
                                break;
                            case DataTypes.ARRAY: 
                                if (!isNumberList(cell)) {
                                    throw new Error(`Cannot convert '${cell}' to an Array<Number>.`)
                                }
                                const numbers = cell.split(',').map(Number); 
                                formattedCell = numbers.sort((a: number, b: number) => a - b);
                                break;
                        }
                    }
                    newRow[processedSchema[colIndex]["column"]] = formattedCell
                }
            } catch (error) {
                rowErrors.push({
                    row: rowIndex + 1,
                    col: colIndex + 1
                })
            }
        })

        if (rowErrors.length === 0)
            processedFile.push(newRow)

        totalErrors.push(...rowErrors);
    });

    console.log("PROCESSED FILE:")
    console.log(processedFile)

    console.log("ERRORS:")
    console.log(totalErrors)

    const newFile: File = new FileModel({
        data: processedFile, 
        job_id: job.id,
    })

    job.job_errors = totalErrors
    job.file_id = newFile.id

    return newFile;
}

export default processFile;
