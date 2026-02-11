import { Box, Paper, Typography, TextField, MenuItem, Button, Stack, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { branches } from "../../data/mock.js";

export default function AddEmployees() {
  const { employees, setEmployees } = useOutletContext();
  const [name, setName] = useState("");
  const [cedula, setCedula] = useState("");
  const [startDate, setStartDate] = useState("");
  const [employeeTag, setEmployeeTag] = useState("cajero");
  const [branchId, setBranchId] = useState("st2");
  const [message, setMessage] = useState("");

  const handleAdd = () => {
    if (!name.trim()) {
      setMessage("Por favor ingresa el nombre del empleado");
      return;
    }
    if (!cedula.trim()) {
      setMessage("Por favor ingresa la cÃ©dula del empleado");
      return;
    }
    if (!startDate) {
      setMessage("Por favor ingresa la fecha de ingreso");
      return;
    }

    const newEmployee = {
      id: Date.now(),
      name: name.trim(),
      cedula: cedula.trim(),
      startDate,
      tag: employeeTag,
      role: "Empleado",
      branchId,
      initials: name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase(),
      clockIn: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      hours: 0,
    };

    setEmployees([...employees, newEmployee]);
    setMessage(`✅ ${name} agregado a ${branches.find((b) => b.id === branchId)?.name}`);
    setName("");
    setCedula("");
    setStartDate("");
    setEmployeeTag("cajero");
    setBranchId("st2");

    setTimeout(() => setMessage(""), 3000);
  };

  const branchName = (id) => branches.find((b) => b.id === id)?.name ?? id;
  const tagOptions = [
    { id: "cajero", label: "Cajero" },
    { id: "gondola", label: "Gondola" },
    { id: "carniceria", label: "Carniceria" },
  ];

  const tagColors = {
    cajero: "#20a4f3",
    gondola: "#12b886",
    carniceria: "#f59f00",
  };


  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Agregar Empleados
        </Typography>
      </Stack>

      {message && <Alert severity={message.includes("✅") ? "success" : "error"} sx={{ mb: 2 }}>{message}</Alert>}

      <Stack spacing={2} sx={{ maxWidth: 500 }}>
        <TextField
          label="Nombre del Empleado"
          placeholder="Ej: Juan Pérez"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <TextField
          label="Cédula"
          placeholder="Ej: 00123456789"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          fullWidth
        />

        <TextField
          label="Fecha de Ingreso"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <TextField
          select
          label="Tag del Empleado"
          value={employeeTag}
          onChange={(e) => setEmployeeTag(e.target.value)}
          fullWidth
        >
          {tagOptions.map((tag) => (
            <MenuItem key={tag.id} value={tag.id}>
              {tag.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Supermercado"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          fullWidth
        >
          {branches.filter((b) => b.id !== "all").map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.name}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ alignSelf: "flex-start" }}
        >
          Agregar Empleado
        </Button>
      </Stack>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Empleados Registrados ({employees.length})
        </Typography>

        {employees.length === 0 ? (
          <Typography color="text.secondary">No hay empleados agregados aún</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {employees.map((emp) => (
              <Box
                key={emp.id}
                sx={{
                  p: 2,
                  border: "1px solid #eee",
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{emp.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cédula: {emp.cedula ?? "N/D"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de ingreso: {emp.startDate ?? "N/D"}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: tagColors[emp.tag] ?? "#999",
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Tag: {tagOptions.find((t) => t.id === emp.tag)?.label ?? "N/D"}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {branchName(emp.branchId)}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => setEmployees(employees.filter((e) => e.id !== emp.id))}
                >
                  Eliminar
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
}





