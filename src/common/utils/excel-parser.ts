import * as xlsx from 'xlsx';

export const parseExcel = (file: Express.Multer.File): any[] => {
  const workbook = xlsx.read(file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
};
