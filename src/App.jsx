import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/user/Users";
import Settings from "./pages/Settings";
import PrivateLayout from "./components/PrivateLayout";
import ManageUser from "./pages/user/ManageUser";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<PrivateLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manageuser" element={<ManageUser />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

    </Routes>
  );
}

export default App;
