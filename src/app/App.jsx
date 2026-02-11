import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../pages/Admin/AdminLayout.jsx";
import ActiveEmployees from "../pages/Admin/ActiveEmployees.jsx";
import HoursRegister from "../pages/Admin/HoursRegister.jsx";
import AddEmployees from "../pages/Admin/AddEmployees.jsx";
import Schedule from "../pages/Admin/Schedule.jsx";
import Kiosk from "../pages/Kiosk/Kiosk.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<ActiveEmployees />} />
        <Route path="registro" element={<HoursRegister />} />
        <Route path="agregar" element={<AddEmployees />} />
        <Route path="horario" element={<Schedule />} />
      </Route>

      <Route path="/kiosco" element={<Kiosk />} />

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
