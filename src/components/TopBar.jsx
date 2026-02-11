import { AppBar, Toolbar, Box, Typography, IconButton, Button, MenuItem, Select } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useNavigate, useLocation } from "react-router-dom";

export default function TopBar({ branchId, setBranchId, branches }) {
  const nav = useNavigate();
  const loc = useLocation();

  const isKiosk = loc.pathname.startsWith("/kiosco");

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid #eee" }}>
      <Toolbar sx={{ gap: 2 }}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: 2,
            display: "grid", placeItems: "center",
            bgcolor: "#2563eb", color: "white"
          }}
        >
          <AccessTimeIcon />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            Sistema de Control de Horas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Panel de Administración
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <StorefrontIcon sx={{ color: "text.secondary" }} />
          <Select size="small" value={branchId} onChange={(e) => setBranchId(e.target.value)} sx={{ minWidth: 220 }}>
            {branches.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ display: "flex", gap: 1, bgcolor: "#f5f5f5", p: 0.5, borderRadius: 2 }}>
          <Button
            variant={isKiosk ? "contained" : "text"}
            onClick={() => nav("/kiosco")}
            startIcon={<AccessTimeIcon />}
            sx={{ borderRadius: 2 }}
          >
            Kiosco
          </Button>

          <Button
            variant={!isKiosk ? "contained" : "text"}
            onClick={() => nav("/admin")}
            startIcon={<AdminPanelSettingsIcon />}
            sx={{ borderRadius: 2 }}
          >
            Admin
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
