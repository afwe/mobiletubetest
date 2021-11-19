import * as actionTypes from './constants';
import { fromJS } from 'immutable';
const defaultState = fromJS ({
    tubeRooms:[],
    enterLoading: true
})
export default (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.CHANGE_ROOMS:
            return state.set ('rooms', action.data);
        case actionTypes.CHANGE_ENTER_LOADING:
            return state.set('enterLoading', action.data);
        default:
            return state;
    }
}