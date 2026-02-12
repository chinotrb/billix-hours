import { Box, Paper, Typography, TextField, MenuItem, Button, Stack, Alert } from "@mui/material";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { branches } from "../../data/mock.js";

const SCHEDULE_STORAGE_KEY = "billix_schedules_v1";
const dayLabels = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

const scheduleTemplate = [
  { id: "cajero-manana", label: "Cajero Manana", shift: "morning", category: "cajero" },
  { id: "cajero-tarde", label: "Cajero Tarde", shift: "afternoon", category: "cajero" },
  { id: "gondola-manana", label: "Gondola Manana", shift: "morning", category: "gondola" },
  { id: "gondola-tarde", label: "Gondola Tarde", shift: "afternoon", category: "gondola" },
  { id: "carniceria-manana", label: "Carniceria Manana", shift: "morning", category: "carniceria" },
  { id: "carniceria-tarde", label: "Carniceria Tarde", shift: "afternoon", category: "carniceria" },
];

const tagColors = {
  cajero: "#20a4f3",
  gondola: "#12b886",
  carniceria: "#f59f00",
};

const getWeekDates = (start) => {
  if (!start) return [];
  const base = new Date(`${start}T00:00:00`);
  if (Number.isNaN(base.getTime())) return [];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d;
  });
};

const formatDateLabel = (date, index) => {
  const day = dayLabels[index] ?? "Dia";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${day} ${dd}/${mm}`;
};

const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const toDateInput = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const readStoredSchedules = () => {
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredSchedules = (items) => {
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(items));
};

const upsertStoredSchedule = (record) => {
  const items = readStoredSchedules();
  const next = items.filter((x) => !(x.branchId === record.branchId && x.weekStart === record.weekStart));
  next.push(record);
  writeStoredSchedules(next);
};

const getStoredSchedule = (branchId, weekStart) => {
  const items = readStoredSchedules();
  return items.find((x) => x.branchId === branchId && x.weekStart === weekStart) ?? null;
};

const hydrateSchedule = (stored) => {
  if (!stored || !Array.isArray(stored.days) || !Array.isArray(stored.slots) || !stored.cells) {
    return null;
  }
  const days = stored.days
    .map((x) => new Date(`${x}T00:00:00`))
    .filter((x) => !Number.isNaN(x.getTime()));
  if (days.length !== 7) return null;
  return {
    days,
    slots: stored.slots,
    cells: stored.cells,
  };
};

const normalizeSchedule = (schedule) => ({
  days: schedule.days.map((d) => toDateInput(d)),
  slots: schedule.slots,
  cells: schedule.cells,
});

const hasEmployeeTag = (employee, tagId) => {
  if (Array.isArray(employee.tags)) return employee.tags.includes(tagId);
  return employee.tag === tagId;
};

export default function Schedule() {
  const { employees } = useOutletContext();
  const [scheduleBranchId, setScheduleBranchId] = useState("st2");
  const [weekStart, setWeekStart] = useState(() => toDateInput(getMonday(new Date())));
  const [message, setMessage] = useState("");
  const [defaultTimes, setDefaultTimes] = useState({
    morning: "06:30 am - 02:20 pm",
    afternoon: "02:00 pm - 10:00 pm",
  });
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    const stored = getStoredSchedule(scheduleBranchId, weekStart);
    const hydrated = hydrateSchedule(stored);
    setSchedule(hydrated);
  }, [scheduleBranchId, weekStart]);

  useEffect(() => {
    if (!schedule || !weekStart) return;
    upsertStoredSchedule({
      branchId: scheduleBranchId,
      weekStart,
      ...normalizeSchedule(schedule),
    });
  }, [schedule, scheduleBranchId, weekStart]);

  const branchName = (id) => branches.find((b) => b.id === id)?.name ?? id;

  const generateSchedule = () => {
    if (!weekStart) {
      setMessage("Por favor selecciona la semana para generar el horario");
      return;
    }
    const days = getWeekDates(weekStart);
    if (days.length !== 7) {
      setMessage("Semana invalida. Revisa la fecha seleccionada.");
      return;
    }
    const cells = {};
    scheduleTemplate.forEach((slot) => {
      days.forEach((_, dayIndex) => {
        const key = `${slot.id}-${dayIndex}`;
        cells[key] = {
          employeeId: "",
          time: defaultTimes[slot.shift] ?? "",
        };
      });
    });
    setSchedule({ days, slots: scheduleTemplate, cells });
    setMessage("");
  };

  const updateCell = (slotId, dayIndex, changes) => {
    setSchedule((prev) => {
      if (!prev) return prev;
      const key = `${slotId}-${dayIndex}`;
      return {
        ...prev,
        cells: {
          ...prev.cells,
          [key]: { ...prev.cells[key], ...changes },
        },
      };
    });
  };

  const exportSchedule = async () => {
    if (!schedule) return;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Horario");
    const branch = branchName(scheduleBranchId);

    ws.addRow([branch, "", "", "", "", "", "", ""]);
    ws.mergeCells(1, 1, 1, 8);
    ws.getCell(1, 1).font = { bold: true, size: 14, name: "Calibri" };
    ws.getCell(1, 1).alignment = { horizontal: "center", vertical: "middle" };

    const headerRow = ["Rol"];
    schedule.days.forEach((d, i) => headerRow.push(formatDateLabel(d, i)));
    ws.addRow(headerRow);

    const header = ws.getRow(2);
    header.font = { bold: true, name: "Calibri", size: 11 };
    header.alignment = { horizontal: "center", vertical: "middle" };
    header.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2F2F2" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FF111111" } },
        left: { style: "thin", color: { argb: "FF111111" } },
        bottom: { style: "thin", color: { argb: "FF111111" } },
        right: { style: "thin", color: { argb: "FF111111" } },
      };
    });

    schedule.slots.forEach((slot) => {
      const rowValues = [slot.label];
      schedule.days.forEach((_, dayIndex) => {
        const key = `${slot.id}-${dayIndex}`;
        const cell = schedule.cells[key];
        const emp = employees.find((e) => e.id === cell.employeeId)?.name ?? "";
        const value = emp ? `${emp}\n${cell.time}` : cell.time;
        rowValues.push(value);
      });
      const row = ws.addRow(rowValues);
      row.height = 32;
      row.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

      const color = tagColors[slot.category] ?? "#999";
      const excelColor = color.replace("#", "");
      for (let c = 2; c <= 8; c += 1) {
        const cell = row.getCell(c);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: `FF${excelColor.toUpperCase()}` },
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FF111111" } },
          left: { style: "thin", color: { argb: "FF111111" } },
          bottom: { style: "thin", color: { argb: "FF111111" } },
          right: { style: "thin", color: { argb: "FF111111" } },
        };
      }
      row.getCell(1).font = { bold: true, name: "Calibri", size: 11 };
      row.getCell(1).alignment = { vertical: "middle" };
      row.getCell(1).border = {
        top: { style: "thin", color: { argb: "FF111111" } },
        left: { style: "thin", color: { argb: "FF111111" } },
        bottom: { style: "thin", color: { argb: "FF111111" } },
        right: { style: "thin", color: { argb: "FF111111" } },
      };
    });

    ws.columns = [
      { width: 22 },
      { width: 22 },
      { width: 22 },
      { width: 22 },
      { width: 22 },
      { width: 22 },
      { width: 22 },
      { width: 22 },
    ];

    ws.eachRow((row) => {
      row.eachCell((cell) => {
        cell.font = { ...(cell.font ?? {}), name: "Calibri", size: 11 };
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `horario_${scheduleBranchId}_${weekStart || "semana"}.xlsx`
    );
  };

  const scheduleEmployees = employees.filter((e) => e.branchId === scheduleBranchId);

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Horario Semanal
      </Typography>

      {message && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Stack spacing={2} sx={{ maxWidth: 720, mb: 3 }}>
        <TextField
          select
          label="Supermercado para el horario"
          value={scheduleBranchId}
          onChange={(e) => setScheduleBranchId(e.target.value)}
          fullWidth
        >
          {branches.filter((b) => b.id !== "all").map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Semana (fecha inicio)"
          type="date"
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 2 }}>
          <TextField
            label="Horario Manana"
            value={defaultTimes.morning}
            onChange={(e) => setDefaultTimes({ ...defaultTimes, morning: e.target.value })}
            fullWidth
          />
          <TextField
            label="Horario Tarde"
            value={defaultTimes.afternoon}
            onChange={(e) => setDefaultTimes({ ...defaultTimes, afternoon: e.target.value })}
            fullWidth
          />
        </Box>

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={generateSchedule}>
            Generar Horario
          </Button>
          <Button variant="outlined" onClick={exportSchedule} disabled={!schedule}>
            Exportar Excel
          </Button>
        </Stack>
      </Stack>

      {scheduleEmployees.length === 0 && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          No hay empleados para este supermercado. Agrega empleados primero.
        </Typography>
      )}

      {schedule && (
        <Box
          sx={{
            overflowX: "auto",
            border: "1px solid #eee",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "220px repeat(7, minmax(180px, 1fr))",
              borderBottom: "1px solid #eee",
              backgroundColor: "#fafafa",
            }}
          >
            <Box sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Rol
              </Typography>
            </Box>
            {schedule.days.map((d, i) => (
              <Box key={`day-${i}`} sx={{ p: 1.5, textAlign: "center" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {formatDateLabel(d, i)}
                </Typography>
              </Box>
            ))}
          </Box>

          {schedule.slots.map((slot) => (
            <Box
              key={slot.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "220px repeat(7, minmax(180px, 1fr))",
                borderBottom: "1px solid #eee",
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: tagColors[slot.category] ?? "#999",
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {slot.label}
                </Typography>
              </Box>
              {schedule.days.map((_, dayIndex) => {
                const key = `${slot.id}-${dayIndex}`;
                const cell = schedule.cells[key];
                const slotEmployees = scheduleEmployees.filter((e) => hasEmployeeTag(e, slot.category));
                const selectEmployees = slotEmployees.length > 0 ? slotEmployees : scheduleEmployees;
                return (
                  <Box key={key} sx={{ p: 1, borderLeft: "1px solid #eee" }}>
                    <TextField
                      select
                      size="small"
                      label="Empleado"
                      value={cell.employeeId}
                      onChange={(e) => updateCell(slot.id, dayIndex, { employeeId: e.target.value })}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      <MenuItem value="">Sin asignar</MenuItem>
                      {selectEmployees.map((emp) => (
                        <MenuItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      size="small"
                      label="Horario"
                      value={cell.time}
                      onChange={(e) => updateCell(slot.id, dayIndex, { time: e.target.value })}
                      fullWidth
                    />
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
