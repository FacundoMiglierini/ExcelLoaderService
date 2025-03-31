import XLSX from 'xlsx';

// This function reads an Excel file from the given file path and converts it to a JSON array of rows.
// It uses the `xlsx` library to parse the Excel file and extract the data from the first sheet.
// The data is returned as an array of rows, where each row is an array of cell values.
export const readExcel = (filePath: string): any[] => {

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; 
    const worksheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: true,
        blankrows: true,
        defval: null,
        rawNumbers: true
    }).slice(1);

    return rows;
}

