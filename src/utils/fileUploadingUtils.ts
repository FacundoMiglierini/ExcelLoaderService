import XLSX from 'xlsx';

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

