import customAxios from './customAxios';

// Auth APIs
export const register = (data) => customAxios.post('/auth/register', data);
export const login = (data) => customAxios.post('/auth/login', data);

// Admin APIs
export const createUser = (data) => customAxios.post('/admin/users', data);
export const editUser = (id, data) => customAxios.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => customAxios.delete(`/admin/users/${id}`);
export const listUsers = (params) => customAxios.get('/admin/users', { params });
export const getAllTransactions = () => customAxios.get('/admin/transactions');
export const addPoints = (data) => customAxios.post('/admin/users/add-nox',data);
export const getUserPoints = (userId) => customAxios.get(`/users/${userId}/points`);

// User APIs
export const getProfile = () => customAxios.get('/users/me');
export const getUserTransactionHistory = (id:string) => customAxios.get(`/users/${id}/transactions`);
export const transferPoints = (data) => customAxios.post('/users/transfer', data);

export default customAxios;
