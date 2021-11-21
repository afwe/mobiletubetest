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
    const { enterLoading, tubeRoomList } = props;
    const { getTubeRoomListDataDispatch } = props;
    let roomList = [
      {
        id:1,
        name: "aaa",
      },
    ]
    const socket = io('wss://localhost:443');
    console.log(socket.id);
    socket.emit('join','1111');
    useEffect (() => {
        getTubeRoomListDataDispatch ();
    }, []);
    const enterDetail = (id) => {
      props.history.push (`/tube/${id}`)
    }
    const tubeRoomJS = tubeRoomList ? tubeRoomList.toJS() : [];
    return (
        <Content>
          { renderRoutes(route.routes) }
          { enterLoading ? <Loading></Loading> : null }
          {
            roomList.map((item,index)=>{
              return(
                  <Card onClick={() => enterDetail (item.id)} key={index}>
                    <p>{item.id}</p>
                    <p>{item.name}</p>
                  </Card>
              )
            })
          }
        </Content>
    );
}



const mapStateToProps = (state) => ({
    tubeRoomList: state.getIn (['tube', 'tubeRooms']),
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