import { Box, Paper, Typography, Container, TextField, MenuItem, Stack, Button } from "@mui/material";
import TopBar from "../../components/TopBar.jsx";
import { branches } from "../../data/mock.js";
import { useMemo, useState } from "react";

const SCHEDULE_STORAGE_KEY = "billix_schedules_v1";
const EMPLOYEES_STORAGE_KEY = "billix_employees_v1";
const dayLabels = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const toDateInput = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const readJsonArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatDayLabel = (dateString, index) => {
  const d = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dayLabels[index] ?? "Dia";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dayLabels[index] ?? "Dia"} ${dd}/${mm}`;
};

export default function Kiosk() {
  const [branchId, setBranchId] = useState("st2");
  const [message, setMessage] = useState("Coloque su tarjeta de empleado frente al escaner");
  const [selectedWeek, setSelectedWeek] = useState("actual");

  const monday = useMemo(() => getMonday(new Date()), []);
  const currentWeekStart = toDateInput(monday);
  const nextWeekStart = toDateInput(addDays(monday, 7));
  const selectedWeekStart = selectedWeek === "siguiente" ? nextWeekStart : currentWeekStart;

  const employees = readJsonArray(EMPLOYEES_STORAGE_KEY);
  const schedules = readJsonArray(SCHEDULE_STORAGE_KEY);

  const demoEmployees = employees
    .filter((e) => e.branchId === branchId)
    .map((x) => ({
      id: x.id,
      name: x.name,
      role: x.role,
      initials: x.initials,
    }));

  const employeesById = useMemo(() => {
    const map = {};
    employees.forEach((e) => {
      map[e.id] = e.name;
    });
    return map;
  }, [employees]);

  const schedule = useMemo(
    () => schedules.find((x) => x.branchId === branchId && x.weekStart === selectedWeekStart) ?? null,
    [schedules, branchId, selectedWeekStart]
  );

  const simulateScan = (emp) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessage(`Marcacion registrada para ${emp.name} - ${now}`);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#eef6ff" }}>
      <TopBar branchId={branchId} setBranchId={setBranchId} branches={branches.filter((b) => b.id !== "all")} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            Iniciar a trabajar
          </Typography>

          <TextField
            select
            label="Sucursal actual"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {branches
              .filter((b) => b.id !== "all")
              .map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
          </TextField>

          <Box
            sx={{
              mt: 3,
              height: 220,
              borderRadius: 3,
              bgcolor: "#0b1220",
              display: "grid",
              placeItems: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box sx={{ width: 170, height: 170, border: "2px dashed rgba(255,255,255,0.25)", borderRadius: 2 }} />
            <Typography sx={{ position: "absolute", bottom: 12, color: "rgba(255,255,255,0.7)" }}>{message}</Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 2 }}>
            Modo demo: haga clic en una tarjeta para simular el escaneo
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }} justifyContent="center" flexWrap="wrap">
            {demoEmployees.map((emp) => (
              <Button key={emp.id} variant="outlined" onClick={() => simulateScan(emp)} sx={{ borderRadius: 3, px: 2, py: 1 }}>
                {emp.initials} - {emp.name}
              </Button>
            ))}
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            Horario de la semana
          </Typography>

          <TextField
            select
            label="Semana visible"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            sx={{ minWidth: 280, mb: 2 }}
          >
            <MenuItem value="actual">Semana actual</MenuItem>
            <MenuItem value="siguiente">Semana siguiente</MenuItem>
          </TextField>

          {!schedule ? (
            <Typography color="text.secondary">
              No hay horario guardado para esta sucursal en la {selectedWeek === "actual" ? "semana actual" : "semana siguiente"}.
            </Typography>
          ) : (
            <Box sx={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 2 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "220px repeat(7, minmax(160px, 1fr))",
                  borderBottom: "1px solid #eee",
                  backgroundColor: "#fafafa",
                }}
              >
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Rol
                  </Typography>
                </Box>
                {schedule.days.map((day, i) => (
                  <Box key={`day-${i}`} sx={{ p: 1.5, textAlign: "center" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {formatDayLabel(day, i)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {schedule.slots.map((slot) => (
                <Box
                  key={slot.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "220px repeat(7, minmax(160px, 1fr))",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {slot.label}
                    </Typography>
                  </Box>

                  {schedule.days.map((_, dayIndex) => {
                    const key = `${slot.id}-${dayIndex}`;
                    const cell = schedule.cells[key];
                    const employeeName = cell?.employeeId ? employeesById[cell.employeeId] ?? "Sin asignar" : "Sin asignar";
                    return (
                      <Box key={key} sx={{ p: 1.5, borderLeft: "1px solid #eee" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {employeeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cell?.time || "Sin horario"}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
