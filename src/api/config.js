import axios from 'axios';
export const baseUrl = "http://localhost:5555";
const axiosInstance = axios.create({
    baseUrl: baseUrl
});
axiosInstance.interceptors.response.use(
    response => response.data,
    error => {
        console.log(error, "网络错误");
    }
);

export {
    axiosInstance
}