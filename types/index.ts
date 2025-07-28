// User 타입 정의
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Memo 타입 정의
export interface Memo {
  id: string;
  userId: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// API 응답 타입 정의
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
