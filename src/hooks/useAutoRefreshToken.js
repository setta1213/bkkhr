import { useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function useAutoRefreshToken(refreshUrl) {
  const navigate = useNavigate();
  const lastActivity = useRef(Date.now());
  const refreshing = useRef(false);

  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    navigate("/");
  };

  // Refresh token
  const doRefresh = async () => {
    if (refreshing.current) return;
    refreshing.current = true;

    const token = localStorage.getItem("userToken");
    if (!token) return logout();

    try {
      const res = await axios.post(refreshUrl, { token });

      if (res.data.status === "success") {
        localStorage.setItem("userToken", res.data.token);
      } else {
        logout();
      }
    } catch (err) {
      logout();
    }

    refreshing.current = false;
  };

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return logout();

    // ดักจับกิจกรรมของผู้ใช้ → ต่ออายุการ active
    const updateActivity = () => {
      lastActivity.current = Date.now();
    };

    ["mousemove", "click", "keydown", "scroll"].forEach(evt =>
      window.addEventListener(evt, updateActivity)
    );

    // ตรวจ token ทุก 1 วินาที
    const interval = setInterval(() => {
      const token = localStorage.getItem("userToken");
      if (!token) return logout();

      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch {
        return logout();
      }

      const now = Math.floor(Date.now() / 1000);
      const exp = decoded.exp;
      const timeLeft = exp - now;

      // ถ้าผู้ใช้ Active และ timeLeft < 10 วิ → refresh
      const userActive = Date.now() - lastActivity.current < 15000; // 15 วิล่าสุดมี activity

      if (userActive && timeLeft < 10) {
        doRefresh();
      }

      // Token หมดอายุ
      if (timeLeft <= 0) {
        logout();
      }

    }, 1000);

    return () => {
      clearInterval(interval);
      ["mousemove", "click", "keydown", "scroll"].forEach(evt =>
        window.removeEventListener(evt, updateActivity)
      );
    };
  }, []);

}
