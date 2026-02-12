import { Box, Paper, Typography, TextField, MenuItem, Button, Stack, Chip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { branches } from "../../data/mock.js";
import { exportHoursRegisterExcel } from "../../utils/exportExcel.js";

const periods = [
  { id: "hoy", label: "Hoy" },
  { id: "semana", label: "Semana" },
  { id: "quincena", label: "Quincena" },
];

export default function HoursRegister() {
  const { branchId, employees } = useOutletContext();
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("hoy");

  // Crear registros de horas basados en empleados
  const rows = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return employees
      .filter((e) => (branchId === "all" ? true : e.branchId === branchId))
      .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
      .map((e) => ({
        id: e.id,
        employee: e.name,
        role: e.role,
        branchId: e.branchId,
        branch: branches.find((b) => b.id === e.branchId)?.name ?? e.branchId,
        date: today,
        in: e.clockIn || "—",
        out: "—",
        hours: "—",
        status: "Turno Abierto",
      }));
  }, [branchId, employees, search]);

  const total = rows.length;
  const currentBranchLabel = branches.find((b) => b.id === branchId)?.name ?? "Todas las Sucursales";
  const currentPeriodLabel = periods.find((p) => p.id === period)?.label ?? "Hoy";

  const handleExport = async () => {
    await exportHoursRegisterExcel(`registro-horas-${period}.xlsx`, rows, {
      branchLabel: currentBranchLabel,
      periodLabel: currentPeriodLabel,
    });
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Registro de Horas
        </Typography>

        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
          Exportar a Excel
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Buscar Empleado"
          placeholder="Nombre del empleado…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />

        <TextField
          select
          label="Período"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          {periods.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.label}
            </MenuItem>
          ))}
        </TextField>

        <Chip label={`Total de registros: ${total}`} sx={{ height: 56, alignSelf: "stretch" }} />
      </Stack>

      {/* Tabla simple */}
      <Box sx={{ border: "1px solid #eee", borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr 1fr 1fr 1fr 1fr 1fr", p: 1.5, bgcolor: "#f9fafb", fontWeight: 700, fontSize: 14 }}>
          <div>Empleado</div>
          <div>Puesto</div>
          <div>Supermercado</div>
          <div>Fecha</div>
          <div>Entrada</div>
          <div>Salida</div>
          <div>Horas</div>
          <div>Estado</div>
        </Box>

        {rows.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
            {employees.length === 0
              ? "No hay empleados agregados aún. Ve a 'Agregar Empleados' para empezar."
              : "No se encontraron registros"}
          </Box>
        ) : (
          rows.map((r) => (
            <Box key={r.id} sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr 1fr 1fr 1fr 1fr 1fr", p: 1.5, borderTop: "1px solid #eee", fontSize: 14 }}>
              <div>{r.employee}</div>
              <div>{r.role}</div>
              <div>{r.branch}</div>
              <div>{r.date}</div>
              <div>{r.in}</div>
              <div>{r.out || "—"}</div>
              <div>{r.hours || "—"}</div>
              <div>{r.status}</div>
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
}
