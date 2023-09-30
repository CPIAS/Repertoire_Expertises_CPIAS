import axios, { AxiosResponse } from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL,
    headers: {
        'Authorization': process.env.REACT_APP_API_KEY
    },
});

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error) => {
        console.error('Axios Request Error:', error);
        return Promise.reject(error);
    }
);

export default axiosInstance;
