import { axiosInstance } from './config'

export const getTubeRooms = () => {
    return axiosInstance.get('api/getRooms');
}