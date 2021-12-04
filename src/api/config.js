import axios from 'axios';
export const baseUrl = "https://localhost:3000";
const axiosInstance = axios.create({
    baseUrl: baseUrl
});
axiosInstance.interceptors.response.use(
    response => {
        console.log(response.data);
        return response.data;
    },
    error => {
        console.log(error, "网络错误");
    }
);

export {
    axiosInstance
}