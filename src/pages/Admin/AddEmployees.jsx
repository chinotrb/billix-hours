import { Box, Paper, Typography, TextField, MenuItem, Button, Stack, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { branches } from "../../data/mock.js";

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

const getEmployeeTags = (emp) => {
  if (Array.isArray(emp.tags) && emp.tags.length > 0) return emp.tags;
  if (emp.tag) return [emp.tag];
  return [];
};

export default function AddEmployees() {
  const { employees, setEmployees } = useOutletContext();
  const [name, setName] = useState("");
  const [cedula, setCedula] = useState("");
  const [startDate, setStartDate] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [employeeTags, setEmployeeTags] = useState(["cajero"]);
  const [branchId, setBranchId] = useState("st2");
  const [message, setMessage] = useState("");

  const handleAdd = () => {
    if (!name.trim()) {
      setMessage("Por favor ingresa el nombre del empleado");
      return;
    }
    if (!cedula.trim()) {
      setMessage("Por favor ingresa la cedula del empleado");
      return;
    }
    if (!startDate) {
      setMessage("Por favor ingresa la fecha de ingreso");
      return;
    }
    if (!employeeTags.length) {
      setMessage("Por favor selecciona al menos un tag");
      return;
    }
    const hourlyRateValue = Number(hourlyRate);
    if (!hourlyRate || Number.isNaN(hourlyRateValue) || hourlyRateValue <= 0) {
      setMessage("Por favor ingresa un pago por hora valido");
      return;
    }

    const newEmployee = {
      id: Date.now(),
      name: name.trim(),
      cedula: cedula.trim(),
      startDate,
      hourlyRate: hourlyRateValue,
      tag: employeeTags[0],
      tags: employeeTags,
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
    setMessage(`Empleado agregado a ${branches.find((b) => b.id === branchId)?.name}`);
    setName("");
    setCedula("");
    setStartDate("");
    setHourlyRate("");
    setEmployeeTags(["cajero"]);
    setBranchId("st2");

    setTimeout(() => setMessage(""), 3000);
  };

  const branchName = (id) => branches.find((b) => b.id === id)?.name ?? id;

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Agregar Empleados
        </Typography>
      </Stack>

      {message && <Alert severity={message.includes("agregado") ? "success" : "error"} sx={{ mb: 2 }}>{message}</Alert>}

      <Stack spacing={2} sx={{ maxWidth: { xs: "100%", md: 500 } }}>
        <TextField
          label="Nombre del Empleado"
          placeholder="Ej: Juan Perez"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <TextField
          label="Cedula"
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
          label="Pago por hora (RD$)"
          type="number"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          inputProps={{ min: 0, step: "0.01" }}
          fullWidth
        />

        <TextField
          select
          label="Tags del Empleado"
          value={employeeTags}
          onChange={(e) => setEmployeeTags(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
          SelectProps={{
            multiple: true,
            renderValue: (selected) =>
              selected
                .map((tagId) => tagOptions.find((t) => t.id === tagId)?.label ?? tagId)
                .join(", "),
          }}
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
          sx={{ alignSelf: { xs: "stretch", md: "flex-start" } }}
        >
          Agregar Empleado
        </Button>
      </Stack>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Empleados Registrados ({employees.length})
        </Typography>

        {employees.length === 0 ? (
          <Typography color="text.secondary">No hay empleados agregados aun</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {employees.map((emp) => {
              const currentTags = getEmployeeTags(emp);
              return (
                <Box
                  key={emp.id}
                  sx={{
                    p: 2,
                    border: "1px solid #eee",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", md: "center" },
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{emp.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cedula: {emp.cedula ?? "N/D"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fecha de ingreso: {emp.startDate ?? "N/D"}
                    </Typography>
                    {currentTags.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Tags: N/D
                      </Typography>
                    ) : (
                      currentTags.map((tagId) => (
                        <Box key={`${emp.id}-${tagId}`} sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: tagColors[tagId] ?? "#999",
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Tag: {tagOptions.find((t) => t.id === tagId)?.label ?? "N/D"}
                          </Typography>
                        </Box>
                      ))
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {branchName(emp.branchId)}
                    </Typography>
                    <TextField
                      size="small"
                      label="Pago por hora (RD$)"
                      type="number"
                      value={emp.hourlyRate ?? ""}
                      inputProps={{ min: 0, step: "0.01" }}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEmployees(
                          employees.map((item) =>
                            item.id === emp.id
                              ? { ...item, hourlyRate: value === "" ? "" : Number(value) }
                              : item
                          )
                        );
                      }}
                      sx={{ mt: 1.5, maxWidth: { xs: "100%", sm: 220 } }}
                    />
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => setEmployees(employees.filter((e) => e.id !== emp.id))}
                    sx={{ alignSelf: { xs: "stretch", md: "center" } }}
                  >
                    Eliminar
                  </Button>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
