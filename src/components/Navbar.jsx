import React, { useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useContext(UserContext);

    const logout = () => {
        localStorage.removeItem("userToken");
        navigate("/");
    };

    
    const menuItems = [
        { name: "Dashboard", path: "/dashboard" },
    ];
    if (user.role === "admin") {
        menuItems.push({ name: "ผู้ใช้งาน", path: "/manageuser" });
        menuItems.push({ name: "การตั้งค่า", path: "/settings" });

    }

    

    return (
        <nav className="w-full bg-blue-700 text-white shadow-md px-6 py-3 flex items-center justify-between">

            {/* LEFT: Brand */}
            <div className="text-2xl font-bold">BKKHR</div>

            {/* CENTER: Menu */}
            <div className="flex items-center gap-6">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`text-sm font-medium px-3 py-1 rounded-md transition 
                ${isActive ? "bg-blue-900 text-white" : "text-blue-200 hover:text-white"}`}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            {/* RIGHT: User + Logout */}
            <div className="flex items-center gap-6">
                <span>👤 {user.firstname} ({user.role})</span>

                <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg shadow"
                >
                    ออกจากระบบ
                </button>
            </div>

        </nav>
    );
}

export default Navbar;
