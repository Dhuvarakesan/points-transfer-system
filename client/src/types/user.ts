export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  isActive: boolean;
  status: 'active' | 'inactive' | 'suspended';
  points: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}
