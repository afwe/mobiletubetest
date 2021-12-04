import React, { useEffect }from 'react';
import { connect } from "react-redux";
import * as actionTypes from './store/actionCreators';
import {
  Content,
  Card,
} from './style';
import Loading from '../../loading/index';
import { renderRoutes } from 'react-router-config';
import io from 'socket.io-client';
function Tube (props){
    const { route } = props;
    const { enterLoading, tubeRooms } = props;
    const { getTubeRoomListDataDispatch } = props;
    useEffect (() => {
        getTubeRoomListDataDispatch ();
    }, []);
    const enterDetail = (id) => {
      props.history.push (`/tube/${id}`)
    }
    const roomList = tubeRooms ? tubeRooms.toJS() : [];
    console.log(roomList);
    return (
        <Content>
          { renderRoutes(route.routes) }
          { enterLoading ? <Loading></Loading> : null }
          <button onClick={()=>enterDetail(roomList.length+1)}>创建房间</button>
          {
            roomList.map((item,index)=>{
              return(
                  <Card onClick={() => enterDetail (item.id)} key={index}>
                    <p>{item.id}</p>
                    <p>{item.name}</p>
                    <p>当前有{item.roomCandidates-1}名观众</p>
                  </Card>
              )
            })
          }
        </Content>
    );
}



const mapStateToProps = (state) => ({
    tubeRooms: state.getIn (['tube', 'tubeRooms']),
    enterLoading: state.getIn(['tube','enterLoading'])
})

const mapDispatchToProps = (dispatch) => {
    return {
      getTubeRoomListDataDispatch () {
        dispatch (actionTypes.getTubeRoomList());
      },
    }
  };

  export default connect (mapStateToProps, mapDispatchToProps)(React.memo (Tube));