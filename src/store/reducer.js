import { combineReducers  } from "redux-immutable";
import { reducer as tubeRoomsReducer } from '../page/Tube/store/index';
export default combineReducers({
    tube: tubeRoomsReducer
})