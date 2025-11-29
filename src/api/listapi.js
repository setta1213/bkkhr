const hotst = "https://api2.koishop.click";
export const API_BASE = `${hotst}/bkkhr/api`;
export const ENDPOINTS = {
  LOGIN: `${API_BASE}/login/login.php`,
  REGISTER: `${API_BASE}/login/register.php`,
  REFRESHTOKEN: `${API_BASE}/refresh_token.php`,
  GET_ME: `${API_BASE}/login/get_meapi.php`,
  GET_ALL_USERS: `${API_BASE}/user/get_all_users.php`,
  UPDATE_USER: `${API_BASE}/user/update_user.php`,
  RESET_PASSWORD: `${API_BASE}/user/reset_password.php`,
  GET_ROLES: `${API_BASE}/user/get_roles.php`,
  DELETE_USER: `${API_BASE}/user/delete_user.php`,
  RESET_PASSWORD_UPDATE: `${API_BASE}/user/reset_password_update.php`,
};
