import React, { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import { ENDPOINTS } from "../../api/listapi";
import { UserContext } from "../../context/UserContext";

function ManageUser() {
    const currentUser = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const [roleList, setRoleList] = useState([]);

    const token = localStorage.getItem("userToken");

    // Check admin permission
    if (currentUser.role !== "admin") {
        return (
            <div className="p-10 text-center text-red-600 font-bold text-2xl">
                ⛔ คุณไม่มีสิทธิ์เข้าหน้านี้
            </div>
        );
    }

    // Load users & roles on mount
    useEffect(() => {
        loadUsers();
        loadRoles();
    }, []);

    const loadUsers = async () => {
        const res = await fetch(ENDPOINTS.GET_ALL_USERS, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === "success") {
            setUsers(data.users);
        }
    };

    const loadRoles = async () => {
        const res = await fetch(ENDPOINTS.GET_ROLES);
        const data = await res.json();
        if (data.status === "success") {
            setRoleList(data.roles);
        }
    };


    const editUser = async (user) => {

        // Create dropdown HTML from role list
        const dropdownHTML = roleList
            .map(
                (r) =>
                    `<option value="${r.role_name}" ${r.role_name === user.role ? "selected" : ""
                    }>${r.display_name}</option>`
            )
            .join("");


        const currentRoleName =
            roleList.find((r) => r.role_name === user.role)?.display_name ||
            user.role;

        const { value: formValues } = await Swal.fire({
            title: `<span class="text-2xl font-bold text-gray-800">แก้ไขผู้ใช้: ${user.username}</span>`,
            // กำหนด customClass ให้ container ของ html เพื่อล้างค่าบางอย่าง
            customClass: {
                confirmButton: 'px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm shadow-sm hover:shadow-md transition-all duration-200 focus:ring-4 focus:ring-indigo-300',
                cancelButton: 'px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-700 font-medium rounded-lg text-sm border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-4 focus:ring-gray-200 mr-2',
                popup: 'rounded-xl', // เพิ่มความโค้งให้ตัว Popup
            },
            buttonsStyling: false,
            html: `
        <div class="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-900 rounded-r-lg mb-6 text-left shadow-sm">
            <p class="text-sm font-medium">
                สถานะปัจจุบัน:
                <span class="text-lg font-bold ml-2">
                    ${currentRoleName} (${user.role})
                </span>
            </p>
        </div>

        <div class="space-y-4 text-left px-2"> 
            
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">ชื่อจริง</label>
                <input id="swal-fn" type="text" value="${user.firstname}" 
                       class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 bg-gray-50 focus:bg-white"
                       placeholder="ระบุชื่อจริง">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">นามสกุล</label>
                <input id="swal-ln" type="text" value="${user.lastname}" 
                       class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 bg-gray-50 focus:bg-white"
                       placeholder="ระบุนามสกุล">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Role ใหม่</label>
                <div class="relative">
                    <select id="swal-role" 
                            class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 bg-gray-50 focus:bg-white cursor-pointer">
                        ${dropdownHTML}
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">รูปภาพโปรไฟล์</label>
                <input id="swal-img" type="text" value="${user.img ?? ""}" 
                       class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150 bg-gray-50 focus:bg-white"
                       placeholder="URL รูปภาพ">
            </div>

        </div>
    `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "💾 บันทึก",
            cancelButtonText: "❌ ยกเลิก",
            // ส่วนนี้สำคัญ: เนื่องจากเราไม่ได้ใช้ swal2-input เราต้องเขียน logic ดึงค่าเองใน preConfirm
            preConfirm: () => {
                return {
                    firstname: document.getElementById('swal-fn').value,
                    lastname: document.getElementById('swal-ln').value,
                    role: document.getElementById('swal-role').value,
                    img: document.getElementById('swal-img').value
                }
            }
        });

        if (!formValues) return;

        // Send update API
        const res = await fetch(ENDPOINTS.UPDATE_USER, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: user.id,
                firstname: document.getElementById("swal-fn").value,
                lastname: document.getElementById("swal-ln").value,
                role: document.getElementById("swal-role").value,
                img: document.getElementById("swal-img").value,
            }),
        });

        const data = await res.json();

        if (data.status === "success") {
            Swal.fire("สำเร็จ", "อัปเดตข้อมูลแล้ว", "success");
            loadUsers();
        } else {
            Swal.fire("ผิดพลาด", data.message, "error");
        }
    };

    const deleteUser = async (user) => {
        const confirm = await Swal.fire({
            title: "ลบผู้ใช้?",
            text: `ต้องการลบผู้ใช้ ${user.username} ใช่หรือไม่?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
        });

        if (!confirm.isConfirmed) return;

        const res = await fetch(ENDPOINTS.DELETE_USER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: user.id }),
        });

        const data = await res.json();

        if (data.status === "success") {
            Swal.fire("สำเร็จ", "ลบผู้ใช้แล้ว", "success");
            loadUsers();
        } else {
            Swal.fire("ผิดพลาด", data.message, "error");
        }
    };


    const resetPassword = async (user) => {
        const confirm = await Swal.fire({
            title: "รีเซ็ตรหัสผ่าน?",
            text: "ต้องการเปลี่ยน role เป็น resetpassword ใช่หรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ใช่",
            cancelButtonText: "ไม่"
        });

        if (!confirm.isConfirmed) return;

        const res = await fetch(ENDPOINTS.RESET_PASSWORD, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ id: user.id })
        });

        const data = await res.json();

        if (data.status === "success") {
            Swal.fire("สำเร็จ", "Role ถูกเปลี่ยนเป็น resetpassword แล้ว", "success");
            loadUsers();
        } else {
            Swal.fire("ผิดพลาด", data.message, "error");
        }
    };
    const createUser = async () => {

        const dropdownHTML = roleList
            .map((r) =>
                `<option value="${r.role_name}">${r.display_name}</option>`
            )
            .join("");

        const { value: formValues } = await Swal.fire({
            title: `<span class="text-2xl font-bold text-gray-800">เพิ่มผู้ใช้ใหม่</span>`,
            width: 500, // กำหนดความกว้างให้พอดี
            customClass: {
                // ปุ่ม Confirm สีเขียว สำหรับการ "Create" พร้อม Shadow
                confirmButton: 'px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm shadow-sm hover:shadow-md transition-all duration-200 focus:ring-4 focus:ring-green-300',
                // ปุ่ม Cancel สีขาว
                cancelButton: 'px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-700 font-medium rounded-lg text-sm border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-4 focus:ring-gray-200 mr-2',
                popup: 'rounded-xl', // มุมโค้งมนสวยงาม
            },
            buttonsStyling: false,
            html: `
        <div class="space-y-4 text-left px-2">

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                <input id="new-username" type="text"
                       class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 bg-gray-50 focus:bg-white"
                       placeholder="ตั้งชื่อผู้ใช้">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input id="new-password" type="password"
                       class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 bg-gray-50 focus:bg-white"
                       placeholder="ตั้งรหัสผ่าน">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">ชื่อจริง</label>
                    <input id="new-fn" type="text"
                           class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 bg-gray-50 focus:bg-white"
                           placeholder="ระบุชื่อจริง">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">นามสกุล</label>
                    <input id="new-ln" type="text"
                           class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 bg-gray-50 focus:bg-white"
                           placeholder="ระบุนามสกุล">
                </div>
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <div class="relative">
                    <select id="new-role" class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm appearance-none focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 bg-gray-50 focus:bg-white cursor-pointer">
                        ${dropdownHTML}
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">รูปภาพโปรไฟล์ (URL)</label>
                <input id="new-img" type="text"
                       class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-150 bg-gray-50 focus:bg-white"
                       placeholder="https://example.com/image.jpg">
            </div>

        </div>
        `,
            showCancelButton: true,
            confirmButtonText: "💾 บันทึก",
            cancelButtonText: "❌ ยกเลิก",
            preConfirm: () => {
                return {
                    username: document.getElementById("new-username").value,
                    password: document.getElementById("new-password").value,
                    firstname: document.getElementById("new-fn").value,
                    lastname: document.getElementById("new-ln").value,
                    role: document.getElementById("new-role").value,
                    img: document.getElementById("new-img").value
                };
            }
        });

        if (!formValues) return;

        // ส่ง API REGISTER
        const res = await fetch(ENDPOINTS.REGISTER, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(formValues)
        });

        const data = await res.json();

        if (data.status === "success") {
            Swal.fire({
                title: "สำเร็จ",
                text: "เพิ่มผู้ใช้ใหม่เรียบร้อย",
                icon: "success",
                confirmButtonText: "ตกลง",
                customClass: {
                    confirmButton: 'px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm shadow-sm'
                },
                buttonsStyling: false
            });
            loadUsers();
        } else {
            Swal.fire({
                title: "ผิดพลาด",
                text: data.message,
                icon: "error",
                confirmButtonText: "ปิด",
                customClass: {
                    confirmButton: 'px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm shadow-sm'
                },
                buttonsStyling: false
            });
        }
    };
    // ----------------------------
    // UI
    // ----------------------------
   return (
    <div className="p-10 min-h-screen bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        จัดการผู้ใช้งานทั้งหมด
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        รายชื่อพนักงานและสิทธิ์การเข้าถึงระบบ
                    </p>
                </div>
                
                <button
                    onClick={createUser}
                    className="mt-4 md:mt-0 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-full shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <span className="text-xl font-bold">+</span> เพิ่มผู้ใช้ใหม่
                </button>
            </div>

            {/* --- Table Section --- */}
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                                    รูปโปรไฟล์
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    บัญชีผู้ใช้
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    ชื่อ-นามสกุล
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    สถานะ (Role)
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                                    จัดการ
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {users.map((u) => (
                                <tr 
                                    key={u.id} 
                                    className="hover:bg-blue-50/50 transition-colors duration-200"
                                >
                                    {/* Avatar */}
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <img
                                                src={u.img || "https://via.placeholder.com/150"}
                                                alt={u.username}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-gray-100"
                                            />
                                        </div>
                                    </td>

                                    {/* Username */}
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {u.username}
                                        </div>
                                        <div className="text-xs text-gray-500">ID: {u.id}</div>
                                    </td>

                                    {/* Name */}
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-700">
                                            {u.firstname} {u.lastname}
                                        </div>
                                    </td>

                                    {/* Role Badge */}
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${u.role === 'Admin' 
                                                ? 'bg-purple-100 text-purple-800' 
                                                : 'bg-blue-100 text-blue-800'}`}>
                                            {u.role}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => editUser(u)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors tooltip"
                                                title="แก้ไขข้อมูล"
                                            >
                                                {/* ใช้ Icon หรือ Text ก็ได้ */}
                                                <span className="font-medium text-sm">แก้ไข</span>
                                            </button>

                                            <div className="h-4 w-px bg-gray-300"></div> {/* Divider */}

                                            <button
                                                onClick={() => resetPassword(u)}
                                                className="p-2 text-amber-500 hover:bg-amber-100 rounded-lg transition-colors"
                                                title="รีเซ็ตรหัสผ่าน"
                                            >
                                                <span className="font-medium text-sm">รีเซ็ต</span>
                                            </button>
                                            
                                            <div className="h-4 w-px bg-gray-300"></div> {/* Divider */}

                                            <button
                                                onClick={() => deleteUser(u)}
                                                className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                                title="ลบผู้ใช้งาน"
                                            >
                                                <span className="font-medium text-sm">ลบ</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Footer of table (Optional) */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500 flex justify-between">
                    <span>แสดงทั้งหมด {users.length} รายการ</span>
                    {/* Pagination could go here */}
                </div>
            </div>
        </div>
    </div>
);
}

export default ManageUser;
