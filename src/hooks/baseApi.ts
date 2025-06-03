import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL ?? 'http://compost-be.hyprhost.online:8900';
// Base instance for our primary API
export const baseApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    ... (localStorage.getItem("_COMP_SSN_HASH") ? { 'Authorization': `Bearer ${localStorage.getItem("_COMP_SSN_HASH")}` } : {}),
    "X-user-id": localStorage.getItem("_COMP_USER_ID") ?? "NA",
    'Content-Type': 'application/json'
  },


});

 
baseApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
        localStorage.removeItem('_COMP_SSN_HASH');
        localStorage.removeItem("_COMP_USER_ID")
        console.log("Unauthorized")
        window.location.href = '/auth/login';
        return Promise.reject(new Error('Unauthorized'));
    } else {
      throw error
    }
  }
);