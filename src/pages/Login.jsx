import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ENDPOINTS } from '../api/listapi';
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(ENDPOINTS.LOGIN, {
        username,
        password,
      });

      if (!response.data) {
        setError("รูปแบบข้อมูลไม่ถูกต้องจากเซิร์ฟเวอร์");
        return;
      }

      const { status, token, user, message } = response.data;

      if (status !== "success") {
        setError(message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      if (!token) {
        setError("ไม่พบ token จากเซิร์ฟเวอร์");
        return;
      }

      // Save token + user
      localStorage.setItem("userToken", token);
      localStorage.setItem("userData", JSON.stringify(user));

      // ---------- CHECK: RESET PASSWORD ----------
      if (user.role === "resetpassword") {
        await Swal.fire({
          title: "รีเซ็ตรหัสผ่านใหม่",
          html: `
            <input id="new-pass" type="password" class="swal2-input" placeholder="รหัสผ่านใหม่ (ขั้นต่ำ 8 ตัว)">
            <input id="new-pass2" type="password" class="swal2-input" placeholder="ยืนยันรหัสผ่านใหม่">
          `,
          confirmButtonText: "บันทึกรหัสผ่าน",
          allowOutsideClick: false,
          showCancelButton: false,
          preConfirm: () => {
            const p1 = document.getElementById("new-pass").value;
            const p2 = document.getElementById("new-pass2").value;

            if (!p1 || p1.length < 8) {
              Swal.showValidationMessage("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
              return false;
            }
            if (p1 !== p2) {
              Swal.showValidationMessage("รหัสผ่านไม่ตรงกัน");
              return false;
            }

            return p1;
          }
        }).then(async (result) => {
          const newPassword = result.value;

          // Call API for update password
          const update = await axios.post(ENDPOINTS.RESET_PASSWORD_UPDATE, {
            username: username,
            new_password: newPassword
          });

          if (update.data.status === "success") {
            Swal.fire("สำเร็จ", "รีเซ็ตรหัสผ่านเรียบร้อย", "success");

            // Update role
            user.role = "user";
            localStorage.setItem("userData", JSON.stringify(user));

            navigate("/dashboard");
          } else {
            Swal.fire("ผิดพลาด", update.data.message, "error");
          }
        });

        return; // stop normal login
      }

      // ---------- NORMAL LOGIN ----------
      setSuccess(
        user
          ? `เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ ${user.firstname} (${user.role})`
          : `เข้าสู่ระบบสำเร็จ!`
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);

    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      } else {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-blue-700">
          BKKHR Login
        </h2>

        {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
        {success && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg">{success}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
            <input type="text" id="username" autoComplete="username" value={username}
              onChange={(e) => setUsername(e.target.value)} required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
              placeholder="Username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <input type="password" autoComplete="current-password" id="password"
              value={password} onChange={(e) => setPassword(e.target.value)} required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg shadow-md text-lg font-semibold text-white transition 
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
