import { AppBar, Toolbar, Box, Typography, Button, MenuItem, Select } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useNavigate, useLocation } from "react-router-dom";

export default function TopBar({ branchId, setBranchId, branches }) {
  const nav = useNavigate();
  const loc = useLocation();

  const isWork = loc.pathname.startsWith("/trabajo") || loc.pathname.startsWith("/kiosco");

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid #eee" }}>
      <Toolbar sx={{ gap: 1.5, flexWrap: "wrap", py: 1 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "#2563eb",
            color: "white",
          }}
        >
          <AccessTimeIcon />
        </Box>

        <Box sx={{ flex: 1, minWidth: { xs: "100%", md: 280 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            Sistema de Control de Horas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Panel de Administracion
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: { xs: "100%", md: "auto" } }}>
          <StorefrontIcon sx={{ color: "text.secondary" }} />
          <Select
            size="small"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            sx={{ minWidth: { xs: 140, sm: 220 }, width: { xs: "100%", md: "auto" } }}
          >
            {branches.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            bgcolor: "#f5f5f5",
            p: 0.5,
            borderRadius: 2,
            width: { xs: "100%", md: "auto" },
          }}
        >
          <Button
            variant={isWork ? "contained" : "text"}
            onClick={() => nav("/trabajo")}
            startIcon={<AccessTimeIcon />}
            sx={{ borderRadius: 2, flex: { xs: 1, md: "initial" } }}
          >
            Trabajo
          </Button>

          <Button
            variant={!isWork ? "contained" : "text"}
            onClick={() => nav("/admin")}
            startIcon={<AdminPanelSettingsIcon />}
            sx={{ borderRadius: 2, flex: { xs: 1, md: "initial" } }}
          >
            Admin
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
