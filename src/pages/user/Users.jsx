import React, { useContext } from "react";
import { UserContext } from "../../context/UserContext";

function Users() {
  const user = useContext(UserContext);

  return (
    <div className="max-w-lg mx-auto bg-white p-6 mt-10 rounded-xl shadow-lg">

      <h1 className="text-2xl font-bold mb-4 text-blue-700">
        ข้อมูลผู้ใช้งาน
      </h1>

     
      <div className="flex justify-center mb-6">
        <img
          src={user.img ? user.img : "https://via.placeholder.com/120"}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover"
        />
      </div>

      {/* ข้อมูลผู้ใช้ */}
      <div className="text-lg space-y-2">

        <p>
          <strong>Username:</strong> {user.username}
        </p>

        <p>
          <strong>ชื่อ:</strong> {user.firstname}
        </p>

        <p>
          <strong>นามสกุล:</strong> {user.lastname}
        </p>

        <p>
          <strong>Role:</strong> {user.role}
        </p>

      </div>

    </div>
  );
}

export default Users;
