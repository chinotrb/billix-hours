import { Box, Paper, Typography, Container, TextField, MenuItem, Stack, Button } from "@mui/material";
import TopBar from "../../components/TopBar.jsx";
import { branches, activeCashiers } from "../../data/mock.js";
import { useState } from "react";

export default function Kiosk() {
  const [branchId, setBranchId] = useState("st2");
  const [message, setMessage] = useState("Coloque su tarjeta de empleado frente al escáner");

  const demoEmployees = activeCashiers.map((x) => ({
    id: x.id,
    name: x.name,
    role: x.role,
    initials: x.initials,
  }));

  const simulateScan = (emp) => {
    // Aquí luego llamas tu API /timelogs/scan
    // Por ahora solo simula
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessage(`✅ Marcación registrada para ${emp.name} - ${now}`);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#eef6ff" }}>
      <TopBar branchId={branchId} setBranchId={setBranchId} branches={branches.filter(b => b.id !== "all")} />

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <TextField
            select
            label="Sucursal Actual"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {branches.filter(b => b.id !== "all").map((b) => (
              <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
            ))}
          </TextField>

          <Typography variant="h4" sx={{ fontWeight: 800, textAlign: "center", mt: 1 }}>
            Escanee su Código QR
          </Typography>

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
            <Typography sx={{ position: "absolute", bottom: 12, color: "rgba(255,255,255,0.7)" }}>
              {message}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 2 }}>
            Modo Demo: haga clic en una tarjeta para simular el escaneo
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }} justifyContent="center" flexWrap="wrap">
            {demoEmployees.map((emp) => (
              <Button
                key={emp.id}
                variant="outlined"
                onClick={() => simulateScan(emp)}
                sx={{ borderRadius: 3, px: 2, py: 1 }}
              >
                {emp.initials} — {emp.name}
              </Button>
            ))}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
