
// Mô tả cấu trúc của User
export interface User {
  user_id: string;
  email: string;
  display_name: string;
  role: 'ADMIN' | 'CUSTOMER' | 'INSPECTOR';
}

// Mô tả dữ liệu trả về khi Login thành công
export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}