import axios from "axios";
import { getConfig } from "./lib/config";



// Create an Axios instance
const customAxios = axios.create({
    baseURL: getConfig().serverBaseUrl, // Ensure all requests are directed to the server
});

// Add a request interceptor to include the access token in headers
customAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add userId and userName to headers
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName');
        if (userId && userName) {
            config.headers.userId = userId;
            config.headers.userName = userName;
        }

        // Debug log for headers
        console.log('Request Headers:', config.headers);

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default customAxios;
