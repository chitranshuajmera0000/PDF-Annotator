import axios from "axios";
import { getToken } from "./utils/auth";

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
})

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})



export const login = (email, password) => api.post('/auth/login', { email, password });
export const signup = (name, email, password) => api.post('/auth/signup', { name, email, password });
export const getPDFs = () => api.get('/pdfs');
export const deletePDF = (uuid) => api.delete(`/pdfs/${uuid}`);
export const getHighlights = (pdfId) => api.get(`/highlights/${pdfId}`);


export default api;