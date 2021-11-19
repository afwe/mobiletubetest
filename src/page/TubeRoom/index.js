import React,{ useState, useEffect  } from 'react';
import {
    Container,
    RemoteVideo
} from './style';
import { CSSTransition } from 'react-transition-group';
import Head from '../../header/index';
function TubeRoom (props){
    console.log("???");
    let roomId;
    const [showStatus, setShowStatus] = useState (true);
    useEffect (()=>{
        let queryStr = props.location.search;
        roomId = queryStr.substr(queryStr.indexOf("=")+1, queryStr.length);
    },[])
    const handleBack = ()=>{
        setShowStatus (false);
    }
    let startX,endX;
    const handleTouchStart = (e)=>{
        console.log("TOUCH");
        startX = e.touches[0].clientX;
    }
    const handleTouchMove = (e)=>{
        endX = e.touches[0].clientX;
    }
    const handleTouchEnd = (e)=>{
        console.log(endX - startX);
        if(endX - startX > 120) {
            setShowStatus (false);
        }
    }
    return(
        <CSSTransition
            in={showStatus}  
            timeout={300} 
            classNames="fly" 
            appear={true} 
            unmountOnExit
            onExited={props.history.goBack}
            onTouchStart={handleTouchStart} onTouchMove ={handleTouchMove} onTouchEnd={handleTouchEnd}
        >
            <Container>
                <div>观看直播</div>
                <RemoteVideo>
                </RemoteVideo>
            </Container>
        </CSSTransition>
    )
}

export default React.memo(TubeRoom);