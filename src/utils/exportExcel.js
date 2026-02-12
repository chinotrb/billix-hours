import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function exportHoursRegisterExcel(filename, rows, meta = {}) {
  if (!rows?.length) return;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Registro de Horas");

  const title = "Registro de Horas de Empleados";
  const branchLabel = meta.branchLabel ?? "Todas las sucursales";
  const periodLabel = meta.periodLabel ?? "Hoy";
  const generatedAt = new Date().toLocaleString();

  ws.addRow([title]);
  ws.mergeCells(1, 1, 1, 8);
  ws.getCell(1, 1).font = { bold: true, size: 15, name: "Calibri" };
  ws.getCell(1, 1).alignment = { horizontal: "center", vertical: "middle" };

  ws.addRow([`Sucursal: ${branchLabel}`, `Periodo: ${periodLabel}`, `Generado: ${generatedAt}`]);
  ws.mergeCells(2, 1, 2, 3);
  ws.mergeCells(2, 4, 2, 5);
  ws.mergeCells(2, 6, 2, 8);
  ws.getRow(2).font = { bold: true, size: 10, name: "Calibri" };

  const headers = ["Empleado", "Puesto", "Supermercado", "Fecha", "Entrada", "Salida", "Horas", "Estado"];
  ws.addRow(headers);
  const headerRow = ws.getRow(3);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, name: "Calibri", size: 11 };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4E78" },
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFD9D9D9" } },
      left: { style: "thin", color: { argb: "FFD9D9D9" } },
      bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
      right: { style: "thin", color: { argb: "FFD9D9D9" } },
    };
  });

  rows.forEach((r, index) => {
    const row = ws.addRow([
      r.employee ?? "",
      r.role ?? "",
      r.branch ?? "",
      r.date ?? "",
      r.in ?? "",
      r.out ?? "",
      r.hours ?? "",
      r.status ?? "",
    ]);
    row.height = 20;
    row.alignment = { vertical: "middle", horizontal: "left" };
    row.eachCell((cell) => {
      cell.font = { name: "Calibri", size: 10 };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE6E6E6" } },
        left: { style: "thin", color: { argb: "FFE6E6E6" } },
        bottom: { style: "thin", color: { argb: "FFE6E6E6" } },
        right: { style: "thin", color: { argb: "FFE6E6E6" } },
      };
      if (index % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FBFF" },
        };
      }
    });
    row.getCell(8).alignment = { horizontal: "center", vertical: "middle" };
  });

  ws.columns = [
    { width: 28 },
    { width: 18 },
    { width: 26 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 12 },
    { width: 18 },
  ];

  ws.autoFilter = {
    from: "A3",
    to: "H3",
  };
  ws.views = [{ state: "frozen", ySplit: 3 }];

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename
  );
}
