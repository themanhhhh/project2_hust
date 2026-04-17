import type { WorkSheet } from 'xlsx';

export function createExcelFileName(screenName: string): string {
  const slug = screenName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const today = new Date();
  const dateStamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return `${slug}-ngay-${dateStamp}.xlsx`;
}

export function styleWorksheet(worksheet: WorkSheet, columnWidths: Array<{ wch: number }>) {
  const range = worksheet['!ref'];
  worksheet['!cols'] = columnWidths;
  worksheet['!autofilter'] = range ? { ref: range } : undefined;
  (worksheet as WorkSheet & { '!freeze'?: { xSplit?: number; ySplit?: number; topLeftCell?: string; activePane?: string; state?: string } })['!freeze'] = {
    xSplit: 0,
    ySplit: 1,
    topLeftCell: 'A2',
    activePane: 'bottomLeft',
    state: 'frozen',
  };

  if (!range) return;

  const [, end = 'A1'] = range.split(':');
  const endColumn = end.replace(/[0-9]/g, '');

  for (let code = 'A'.charCodeAt(0); code <= endColumn.charCodeAt(0); code += 1) {
    const cellRef = `${String.fromCharCode(code)}1`;
    const cell = worksheet[cellRef] as (typeof worksheet)[string] & { s?: Record<string, unknown> };
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '111111' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }
  }
}
