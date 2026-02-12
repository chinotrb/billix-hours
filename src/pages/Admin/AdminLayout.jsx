import { Box, Container, Tabs, Tab, Paper } from "@mui/material";
import TopBar from "../../components/TopBar.jsx";
import { branches } from "../../data/mock.js";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

const EMPLOYEES_STORAGE_KEY = "billix_employees_v1";

export default function AdminLayout() {
  const [branchId, setBranchId] = useState("all");
  const [employees, setEmployees] = useState(() => {
    try {
      const raw = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  const tab = useMemo(() => {
    if (loc.pathname.includes("/admin/registro")) return 1;
    if (loc.pathname.includes("/admin/agregar")) return 2;
    if (loc.pathname.includes("/admin/horario")) return 3;
    return 0;
  }, [loc.pathname]);

  const handleTab = (_, value) => {
    if (value === 0) nav("/admin");
    if (value === 1) nav("/admin/registro");
    if (value === 2) nav("/admin/agregar");
    if (value === 3) nav("/admin/horario");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f7fafc" }}>
      <TopBar branchId={branchId} setBranchId={setBranchId} branches={branches} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Tabs value={tab} onChange={handleTab}>
            <Tab label="Empleados Activos" />
            <Tab label="Registro de Horas" />
            <Tab label="Agregar Empleados" />
            <Tab label="Horario" />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 3 }}>
          <Outlet context={{ branchId, employees, setEmployees }} />
        </Box>
      </Container>
    </Box>
  );
}
