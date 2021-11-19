import * as actionType from './constants';
import { fromJS } from 'immutable';
import { getTubeRooms } from '../../../api/request';

export const changeRoomList = (data) => ({
    type: actionType.CHANGE_ROOMS,
    data: fromJS(data)
})

export const changeEnterLoading = (data) => ({
    type: actionType.CHANGE_ENTER_LOADING,
    data: fromJS(data)
})

export const getTubeRoomList = () => {
    return (dispatch) => {
        getTubeRooms()
        .then(data => {
            dispatch (changeRoomList (data.rooms));
            dispatch (changeEnterLoading (false));
        })
        .catch(()=>{
            console.log("room列表获取失败");
            dispatch (changeEnterLoading (false));
        })
    }
}