import axios from 'axios'

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api` })

export const getCategories = () => api.get('/categories').then(r => r.data)
export const createCategory = (data) => api.post('/categories', data).then(r => r.data)

export const getTransactions = (params) => api.get('/transactions', { params }).then(r => r.data)
export const createTransaction = (data) => api.post('/transactions', data).then(r => r.data)
export const updateTransaction = (id, data) => api.put(`/transactions/${id}`, data).then(r => r.data)
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`).then(r => r.data)
export const getSummary = (params) => api.get('/transactions/summary', { params }).then(r => r.data)

export const exportData = () => api.get('/export').then(r => r.data)