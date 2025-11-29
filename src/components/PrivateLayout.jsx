import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import useAutoRefreshToken from "../hooks/useAutoRefreshToken";
import { ENDPOINTS } from "../api/listapi";
import { jwtDecode } from "jwt-decode";
import { UserContext } from "../context/UserContext";

function PrivateLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useAutoRefreshToken(ENDPOINTS.REFRESHTOKEN);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);

      if (decoded.exp < now) {
        localStorage.removeItem("userToken");
        navigate("/");
        return;
      }

      // โหลดข้อมูล user จาก API
      const loadUser = async () => {
        try {
          const res = await fetch(ENDPOINTS.GET_ME, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (data.status !== "success") {
            navigate("/");
            return;
          }

          setUser(data.user);
          setLoading(false);
        } catch (err) {
          navigate("/");
        }
      };

      loadUser();

    } catch (error) {
      navigate("/");
    }

  }, [navigate]);

  // ยังไม่โหลด user → แสดง loading ก่อน
  if (loading) {
    return <div className="p-6 text-center">กำลังโหลดข้อมูลผู้ใช้...</div>;
  }

  return (
    <UserContext.Provider value={user}>
      <Navbar />
      <div className="mt-10 px-4">
        <Outlet />
      </div>
    </UserContext.Provider>
  );
}

export default PrivateLayout;
