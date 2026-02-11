import { Box, Paper, Typography, Chip, Stack, Avatar } from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { branches } from "../../data/mock.js";

export default function ActiveEmployees() {
  const { branchId, employees } = useOutletContext();

  const items = employees.filter((x) => branchId === "all" || x.branchId === branchId);
  const activeCount = items.length;

  const branchName = (id) => branches.find((b) => b.id === id)?.name ?? id;

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Empleados Registrados
        </Typography>
        <Chip label={`${activeCount} Total`} />
      </Stack>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((x) => (
          <Box key={x.id} sx={{ border: "1px solid #eee", borderRadius: 3, p: 2 }}>
            <Typography variant="subtitle2" sx={{ color: "#2563eb", fontWeight: 700, mb: 1 }}>
              • {branchName(x.branchId)}
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "#16a34a", width: 44, height: 44 }}>
                {x.initials}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>{x.name}</Typography>
                <Typography variant="body2" color="text.secondary">{x.role}</Typography>
              </Box>
            </Stack>
          </Box>
        ))}

        {items.length === 0 && (
          <Typography color="text.secondary">
            {employees.length === 0
              ? "No hay empleados agregados. Ve a la pestaña 'Agregar Empleados' para registrar a alguien."
              : "No hay empleados en esta sucursal."}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
