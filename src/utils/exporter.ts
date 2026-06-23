import * as XLSX from 'xlsx';
import { FeasibilityReports } from './finance.js';

// ─── Color Palette (ARGB) ───────────────────────────────────────────────────
const COLOR = {
  BRAND_DARK:   'FF141413', // brand-ink (near-black)
  BRAND_CREAM:  'FFF5F0E8', // brand-surface-soft (beige)
  BRAND_ACCENT: 'FFCC785C', // brand-primary (terracotta)
  BRAND_TEAL:   'FF5DB8A6', // brand-accent-teal
  BRAND_CANVAS: 'FFFAF9F5', // brand-canvas
  WHITE:        'FFFFFFFF',
  HEADER_BG:    'FF3D3D3A', // brand-body (dark gray for section headers)
  SUBHEAD_BG:   'FFE8E0D2', // brand-surface-cream-strong
  GREEN:        'FF166534', // emerald-800
  GREEN_BG:     'FFF0FDF4', // emerald-50
  RED:          'FF991B1B', // red-800
  RED_BG:       'FFFFF0F0',
  TOTAL_BG:     'FFFFF7F2', // soft orange for totals
  TOTAL_BORDER: 'FFCC785C',
  GREY_TEXT:    'FF6C6A64', // brand-muted
  LIGHT_BORDER: 'FFD5CFC6',
};

// ─── Style Factories ────────────────────────────────────────────────────────
function makeStyle(overrides: Partial<XLSX.CellStyle> = {}): XLSX.CellStyle {
  return {
    font: { name: 'Calibri', sz: 10, color: { rgb: COLOR.BRAND_DARK }, ...overrides.font },
    alignment: { vertical: 'center', wrapText: false, ...overrides.alignment },
    border: {
      top:    { style: 'thin', color: { rgb: COLOR.LIGHT_BORDER } },
      bottom: { style: 'thin', color: { rgb: COLOR.LIGHT_BORDER } },
      left:   { style: 'thin', color: { rgb: COLOR.LIGHT_BORDER } },
      right:  { style: 'thin', color: { rgb: COLOR.LIGHT_BORDER } },
      ...overrides.border,
    },
    fill: overrides.fill,
    numFmt: overrides.numFmt,
  } as XLSX.CellStyle;
}

const sectionHeaderStyle = makeStyle({
  font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: COLOR.WHITE } },
  fill: { patternType: 'solid', fgColor: { rgb: COLOR.HEADER_BG } },
  alignment: { vertical: 'center', horizontal: 'left' },
  border: {},
});

const colHeaderStyle = makeStyle({
  font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: COLOR.WHITE } },
  fill: { patternType: 'solid', fgColor: { rgb: COLOR.BRAND_ACCENT } },
  alignment: { vertical: 'center', horizontal: 'center' },
  border: {
    top:    { style: 'medium', color: { rgb: COLOR.BRAND_ACCENT } },
    bottom: { style: 'medium', color: { rgb: COLOR.BRAND_ACCENT } },
    left:   { style: 'thin',   color: { rgb: COLOR.WHITE } },
    right:  { style: 'thin',   color: { rgb: COLOR.WHITE } },
  },
});

const rowLabelStyle = makeStyle({
  font: { name: 'Calibri', sz: 10, color: { rgb: COLOR.BRAND_DARK } },
  fill: { patternType: 'solid', fgColor: { rgb: COLOR.BRAND_CREAM } },
  alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
});

const rowLabelIndentStyle = makeStyle({
  font: { name: 'Calibri', sz: 10, color: { rgb: COLOR.GREY_TEXT }, italic: true },
  fill: { patternType: 'solid', fgColor: { rgb: COLOR.BRAND_CANVAS } },
  alignment: { vertical: 'center', horizontal: 'left', indent: 3 },
});

const rowLabelSubtotalStyle = makeStyle({
  font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: COLOR.BRAND_DARK } },
  fill: { patternType: 'solid', fgColor: { rgb: COLOR.SUBHEAD_BG } },
  alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
});

const totalLabelStyle = makeStyle({
  font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: COLOR.BRAND_ACCENT } },
  fill: { patternType: 'solid', fgColor: { rgb: COLOR.TOTAL_BG } },
  alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
  border: {
    top:    { style: 'medium', color: { rgb: COLOR.TOTAL_BORDER } },
    bottom: { style: 'medium', color: { rgb: COLOR.TOTAL_BORDER } },
    left:   { style: 'thin',   color: { rgb: COLOR.LIGHT_BORDER } },
    right:  { style: 'thin',   color: { rgb: COLOR.LIGHT_BORDER } },
  },
});

function valueStyle(positive: boolean, isSubtotal = false, isTotal = false): XLSX.CellStyle {
  const fgColor = isTotal ? COLOR.TOTAL_BG : isSubtotal ? COLOR.SUBHEAD_BG : COLOR.BRAND_CANVAS;
  return makeStyle({
    font: {
      name: 'Calibri',
      sz: 10,
      bold: isTotal || isSubtotal,
      color: { rgb: positive ? COLOR.GREEN : COLOR.RED },
    },
    fill: { patternType: 'solid', fgColor: { rgb: fgColor } },
    alignment: { vertical: 'center', horizontal: 'right' },
    numFmt: '#,##0.00',
    border: isTotal ? {
      top:    { style: 'medium', color: { rgb: COLOR.TOTAL_BORDER } },
      bottom: { style: 'medium', color: { rgb: COLOR.TOTAL_BORDER } },
      left:   { style: 'thin',   color: { rgb: COLOR.LIGHT_BORDER } },
      right:  { style: 'thin',   color: { rgb: COLOR.LIGHT_BORDER } },
    } : undefined,
  });
}

function neutralValueStyle(isSubtotal = false, isTotal = false): XLSX.CellStyle {
  const fgColor = isTotal ? COLOR.TOTAL_BG : isSubtotal ? COLOR.SUBHEAD_BG : COLOR.BRAND_CANVAS;
  return makeStyle({
    font: { name: 'Calibri', sz: 10, bold: isTotal || isSubtotal, color: { rgb: COLOR.GREY_TEXT } },
    fill: { patternType: 'solid', fgColor: { rgb: fgColor } },
    alignment: { vertical: 'center', horizontal: 'right' },
    numFmt: '#,##0.0000',
  });
}

// ─── Cell helpers ───────────────────────────────────────────────────────────
function c(value: string | number | null, style: XLSX.CellStyle): XLSX.CellObject {
  return {
    v: value ?? '',
    t: typeof value === 'number' ? 'n' : 's',
    s: style,
  } as XLSX.CellObject;
}

function writeRow(ws: XLSX.WorkSheet, rowIdx: number, cells: XLSX.CellObject[], startCol = 0) {
  const cols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  cells.forEach((cell, i) => {
    const addr = `${cols[startCol + i]}${rowIdx + 1}`;
    ws[addr] = cell;
  });
}

function sectionHeader(ws: XLSX.WorkSheet, rowIdx: number, label: string, colCount: number) {
  const cols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  ws[`A${rowIdx + 1}`] = { v: label, t: 's', s: sectionHeaderStyle } as XLSX.CellObject;
  for (let i = 1; i <= colCount; i++) {
    ws[`${cols[i]}${rowIdx + 1}`] = { v: '', t: 's', s: sectionHeaderStyle } as XLSX.CellObject;
  }
}

function emptyRow(ws: XLSX.WorkSheet, rowIdx: number, colCount: number) {
  const cols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i <= colCount; i++) {
    ws[`${cols[i]}${rowIdx + 1}`] = { v: '', t: 's', s: {} as XLSX.CellStyle };
  }
}

// ─── Sheet: Summary ──────────────────────────────────────────────────────────
function buildSummarySheet(report: FeasibilityReports, projectName: string): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};

  const titleStyle = makeStyle({
    font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: COLOR.BRAND_ACCENT } },
    fill: { patternType: 'solid', fgColor: { rgb: COLOR.BRAND_CANVAS } },
    border: {},
    alignment: { vertical: 'center', horizontal: 'left' },
  });
  const subtitleStyle = makeStyle({
    font: { name: 'Calibri', sz: 10, color: { rgb: COLOR.GREY_TEXT } },
    fill: { patternType: 'solid', fgColor: { rgb: COLOR.BRAND_CANVAS } },
    border: {},
  });
  const kpiLabelStyle = makeStyle({
    font: { name: 'Calibri', sz: 10, color: { rgb: COLOR.BRAND_DARK } },
    fill: { patternType: 'solid', fgColor: { rgb: COLOR.BRAND_CREAM } },
    alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
  });
  const kpiValueStyle = makeStyle({
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: COLOR.BRAND_ACCENT } },
    fill: { patternType: 'solid', fgColor: { rgb: COLOR.TOTAL_BG } },
    alignment: { vertical: 'center', horizontal: 'right' },
    border: {
      top:    { style: 'thin', color: { rgb: COLOR.LIGHT_BORDER } },
      bottom: { style: 'thin', color: { rgb: COLOR.LIGHT_BORDER } },
      left:   { style: 'thin', color: { rgb: COLOR.LIGHT_BORDER } },
      right:  { style: 'thin', color: { rgb: COLOR.LIGHT_BORDER } },
    },
  });
  const feasibleStyle = makeStyle({
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: report.metrics.isFeasible ? COLOR.GREEN : COLOR.RED } },
    fill: { patternType: 'solid', fgColor: { rgb: report.metrics.isFeasible ? COLOR.GREEN_BG : COLOR.RED_BG } },
    alignment: { vertical: 'center', horizontal: 'center' },
    border: {
      top:    { style: 'medium', color: { rgb: report.metrics.isFeasible ? COLOR.GREEN : COLOR.RED } },
      bottom: { style: 'medium', color: { rgb: report.metrics.isFeasible ? COLOR.GREEN : COLOR.RED } },
      left:   { style: 'thin',   color: { rgb: COLOR.LIGHT_BORDER } },
      right:  { style: 'thin',   color: { rgb: COLOR.LIGHT_BORDER } },
    },
  });

  let r = 0;
  ws['A1'] = { v: `FinanceFeasibility Report — ${projectName}`, t: 's', s: titleStyle } as XLSX.CellObject;
  ws['A2'] = { v: `Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, t: 's', s: subtitleStyle } as XLSX.CellObject;

  r = 3; // row 4
  sectionHeader(ws, r, '📊  KEY METRICS SUMMARY', 2);

  const kpis: [string, string][] = [
    ['Net Present Value (NPV)', `$${report.metrics.npv.toLocaleString('en-US', { maximumFractionDigits: 2 })}`],
    ['Internal Rate of Return (IRR)', report.metrics.irr ? `${report.metrics.irr.toFixed(2)}%` : 'N/A'],
    ['Return on Investment (ROI)', `${report.metrics.roi.toFixed(2)}%`],
    ['Payback Period', report.metrics.paybackFormatted],
    ['Hurdle Discount Rate', `${report.inputs.discountRate}%`],
  ];

  kpis.forEach(([label, val], i) => {
    r = 4 + i;
    ws[`A${r + 1}`] = { v: label, t: 's', s: kpiLabelStyle } as XLSX.CellObject;
    ws[`B${r + 1}`] = { v: val,   t: 's', s: kpiValueStyle } as XLSX.CellObject;
    ws[`C${r + 1}`] = { v: '',    t: 's', s: {} as XLSX.CellStyle };
  });

  r = 9;
  ws[`A${r + 1}`] = { v: 'Feasibility Verdict', t: 's', s: kpiLabelStyle } as XLSX.CellObject;
  ws[`B${r + 1}`] = { v: report.metrics.isFeasible ? '✅  FEASIBLE' : '⚠️  MARGINAL / UNFEASIBLE', t: 's', s: feasibleStyle } as XLSX.CellObject;

  r = 11;
  sectionHeader(ws, r, '⚙️  INPUT ASSUMPTIONS', 2);

  const inputs: [string, string][] = [
    ['Capital Outlay',                `$${Number(report.inputs.investmentCost).toLocaleString()}`],
    ['Monthly Baseline Revenue',      `$${Number(report.inputs.monthlyRevenue).toLocaleString()}`],
    ['Yearly Revenue Growth Rate',    `${report.inputs.growthRate}%`],
    ['Operating Costs (Monthly)',     `$${Number(report.inputs.operatingCost).toLocaleString()}`],
    ['Annual Maintenance Costs',      `$${Number(report.inputs.maintenanceCost).toLocaleString()}`],
    ['Cost Inflation Rate',           `${report.inputs.inflationRate}%`],
    ['Corporate Tax Bracket',         `${report.inputs.taxRate}%`],
    ['Residual / Salvage Value',      `$${Number(report.inputs.residualValue).toLocaleString()}`],
    ['Useful Depreciation Period',    `${report.inputs.depreciationYears} Years`],
    ['Analysis Horizon',              `${report.inputs.analysisYears} Years`],
  ];

  inputs.forEach(([label, val], i) => {
    const rowNum = 12 + i + 1;
    ws[`A${rowNum}`] = { v: label, t: 's', s: rowLabelStyle   } as XLSX.CellObject;
    ws[`B${rowNum}`] = { v: val,   t: 's', s: kpiValueStyle   } as XLSX.CellObject;
    ws[`C${rowNum}`] = { v: '',    t: 's', s: {} as XLSX.CellStyle };
  });

  ws['!ref'] = `A1:C${12 + inputs.length + 1}`;
  ws['!cols'] = [{ wch: 38 }, { wch: 22 }, { wch: 5 }];
  ws['!rows'] = Array(12 + inputs.length + 1).fill({ hpx: 20 });
  ws['!rows'][0] = { hpx: 32 };
  ws['!rows'][3] = { hpx: 24 };
  ws['!rows'][11] = { hpx: 24 };

  return ws;
}

// ─── Sheet Builder: Income, Balance, CashFlow ────────────────────────────────
function buildDataSheet(
  ws: XLSX.WorkSheet,
  title: string,
  headers: string[],
  rows: Array<{ label: string; values: (number | string)[]; style: 'normal' | 'indent' | 'subtotal' | 'total' | 'neutral' | 'section' }>,
  yearLabels: string[],
): XLSX.WorkSheet {
  const allCols = ['A', 'B', ...yearLabels.map((_, i) => String.fromCharCode(67 + i))]; // A=label, B=empty gutter, C+

  // Title row
  ws['A1'] = { v: title, t: 's', s: makeStyle({
    font: { name: 'Calibri', sz: 12, bold: true, color: { rgb: COLOR.BRAND_ACCENT } },
    border: {},
    fill: { patternType: 'solid', fgColor: { rgb: COLOR.BRAND_CANVAS } },
  }) } as XLSX.CellObject;

  // Header row (row 2)
  ws['A2'] = { v: headers[0], t: 's', s: colHeaderStyle } as XLSX.CellObject;
  yearLabels.forEach((yr, i) => {
    ws[`${String.fromCharCode(67 + i)}2`] = { v: yr, t: 's', s: colHeaderStyle } as XLSX.CellObject;
  });

  // Data rows
  rows.forEach((row, rowI) => {
    const r = rowI + 3; // data starts at row 3
    const lStyle =
      row.style === 'section'  ? sectionHeaderStyle :
      row.style === 'total'    ? totalLabelStyle :
      row.style === 'subtotal' ? rowLabelSubtotalStyle :
      row.style === 'indent'   ? rowLabelIndentStyle :
      rowLabelStyle;

    ws[`A${r}`] = { v: row.label, t: 's', s: lStyle } as XLSX.CellObject;

    row.values.forEach((val, colI) => {
      const col = String.fromCharCode(67 + colI);
      if (typeof val === 'string') {
        ws[`${col}${r}`] = { v: val, t: 's', s: neutralValueStyle(row.style === 'subtotal', row.style === 'total') } as XLSX.CellObject;
      } else if (row.style === 'neutral') {
        ws[`${col}${r}`] = { v: val, t: 'n', s: neutralValueStyle() } as XLSX.CellObject;
      } else {
        ws[`${col}${r}`] = { v: val, t: 'n', s: valueStyle(val >= 0, row.style === 'subtotal', row.style === 'total') } as XLSX.CellObject;
      }
    });
  });

  const totalCols = 1 + yearLabels.length;
  const lastCol = allCols[totalCols] ?? String.fromCharCode(67 + yearLabels.length - 1);
  ws['!ref'] = `A1:${lastCol}${rows.length + 2}`;
  ws['!cols'] = [
    { wch: 36 }, // label column
    ...yearLabels.map(() => ({ wch: 16 })),
  ];
  ws['!rows'] = [{ hpx: 28 }, { hpx: 22 }, ...rows.map(r => ({ hpx: r.style === 'section' ? 22 : 19 }))];

  return ws;
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export function exportToExcel(report: FeasibilityReports, projectName: string) {
  const wb = XLSX.utils.book_new();

  // ── Tab 1: Summary ──
  const summaryWs = buildSummarySheet(report, projectName);
  XLSX.utils.book_append_sheet(wb, summaryWs, '📋 Summary');

  // ── Tab 2: Income Statement ──
  const incomeYears = report.incomeStatement.map(r => `Year ${r.year}`);
  const incomeWs: XLSX.WorkSheet = {};
  buildDataSheet(incomeWs, 'Income Statement Projections', ['Financial Item', ...incomeYears], [
    { label: 'Gross Revenues',            values: report.incomeStatement.map(r => r.revenue),        style: 'normal' },
    { label: '  − Operating Costs',       values: report.incomeStatement.map(r => -r.operatingCost), style: 'indent' },
    { label: '  − Maintenance Overhead',  values: report.incomeStatement.map(r => -r.maintenanceCost), style: 'indent' },
    { label: 'EBITDA',                    values: report.incomeStatement.map(r => r.ebitda),          style: 'subtotal' },
    { label: '  − Asset Depreciation',   values: report.incomeStatement.map(r => -r.depreciation),  style: 'indent' },
    { label: 'Earnings Before Tax (EBT)', values: report.incomeStatement.map(r => r.ebt),             style: 'subtotal' },
    { label: `  − Corporate Tax (${report.inputs.taxRate}%)`, values: report.incomeStatement.map(r => -r.tax), style: 'indent' },
    { label: 'Net Income (Profit)',        values: report.incomeStatement.map(r => r.netIncome),       style: 'total' },
  ], incomeYears);
  XLSX.utils.book_append_sheet(wb, incomeWs, '💹 Income Statement');

  // ── Tab 3: Balance Sheet ──
  const bsYears = report.balanceSheet.map(r => r.year === 0 ? 'Year 0' : `Year ${r.year}`);
  const bsWs: XLSX.WorkSheet = {};
  buildDataSheet(bsWs, 'Balance Sheet Projections', ['Balance Sheet Item', ...bsYears], [
    { label: 'ASSETS', values: bsYears.map(() => ''), style: 'section' },
    { label: '  Gross Fixed Assets (Capex)', values: report.balanceSheet.map(r => r.grossFixedAssets), style: 'indent' },
    { label: '  − Accumulated Depreciation', values: report.balanceSheet.map(r => -r.accumulatedDepreciation), style: 'indent' },
    { label: 'Net Fixed Assets (Book Value)', values: report.balanceSheet.map(r => r.netFixedAssets), style: 'subtotal' },
    { label: '  Project Cumulative Cash',    values: report.balanceSheet.map(r => r.cumulativeCash), style: 'indent' },
    { label: 'TOTAL PROJECT ASSETS',         values: report.balanceSheet.map(r => r.totalAssets), style: 'total' },
    { label: 'EQUITY & CAPITAL', values: bsYears.map(() => ''), style: 'section' },
    { label: '  Initial Equity Contribution', values: report.balanceSheet.map(r => r.initialEquity), style: 'indent' },
    { label: '  Retained Project Earnings',   values: report.balanceSheet.map(r => r.retainedEarnings), style: 'indent' },
    { label: 'TOTAL CAPITAL EQUITY',          values: report.balanceSheet.map(r => r.totalEquity), style: 'total' },
  ], bsYears);
  XLSX.utils.book_append_sheet(wb, bsWs, '🏦 Balance Sheet');

  // ── Tab 4: Cash Flow ──
  const cfYears = report.cashFlowStatement.map(r => r.year === 0 ? 'Year 0' : `Year ${r.year}`);
  const cfWs: XLSX.WorkSheet = {};
  buildDataSheet(cfWs, 'Cash Flow Statement Projections', ['Cash Flow Item', ...cfYears], [
    { label: 'Operating Cash Inflows',     values: report.cashFlowStatement.map(r => r.operatingCashFlow),  style: 'normal' },
    { label: 'Capital / Salvage Investments', values: report.cashFlowStatement.map(r => r.investingCashFlow), style: 'normal' },
    { label: 'Net Cash Flow',              values: report.cashFlowStatement.map(r => r.totalCashFlow),       style: 'subtotal' },
    { label: `Discount Factor (${report.inputs.discountRate}%)`, values: report.cashFlowStatement.map(r => r.discountFactor), style: 'neutral' },
    { label: 'Discounted Net Cash Flow',   values: report.cashFlowStatement.map(r => r.discountedCashFlow), style: 'normal' },
    { label: 'Cumulative Project Balance', values: report.cashFlowStatement.map(r => r.cumulativeCashFlow), style: 'total' },
  ], cfYears);
  XLSX.utils.book_append_sheet(wb, cfWs, '💰 Cash Flow');

  // ── Write file ──
  XLSX.writeFile(wb, `Feasibility_Report_${projectName.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Legacy CSV export kept for backwards-compat — now unused.
 * @deprecated Use exportToExcel instead.
 */
export function exportToCSV(report: FeasibilityReports, projectName: string) {
  exportToExcel(report, projectName);
}

/**
 * Trigger print dialog with specific print CSS stylesheet injection to cleanly
 * export the reports panel as a high resolution vector PDF
 */
export function exportToPDF() {
  window.print();
}
