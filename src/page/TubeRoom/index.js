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
    const handleErr = function(err){
        console.error(err);
    }
    const sendMessage = function(id,data){
        if(this.socket){
            this.socket.emit('message',id,data);
        }
    }
    const getOffer = function(desc,masterId){
        this.pc.setLocalDescription(desc);
        this.sendMessage(masterId,desc);
    }
    const call = function(masterId){
        if(this.pc){
            console.log('pcsurvive');
            let options = {
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 1
            }
            if(this.state == 'slave'){
                console.log('offercall');
                this.pc.createOffer(options)
                .then((desc)=>{
                    this.getOffer(desc,masterId);
                })
                .catch(this.handleErr)
            }
        }
    }

    const getMediaStream = function(stream){
        this.localStream = stream;
        this.localVideo.srcObject = this.localStream;
    }
    const masterGetOffer = function(id,message){
        console.log(id);
        this.peerConnectionCollection[id].setRemoteDescription(new RTCSessionDescription(message));
        this.peerConnectionCollection[id].createAnswer().then((answer)=>{this.getAnswer(answer,id)}).catch(this.handleErr);
    }
    const masterAddCandidate = function(id,candidate){
        this.peerConnectionCollection[id].addIceCandidate(candidate).catch();
    }
    const getAnswer = function(desc,id){
        this.peerConnectionCollection[id].setLocalDescription(desc);
        this.sendMessage(id,desc);
    }
    const initSocketIO = function(){
        this.socket.on('newSlave',(id)=>{
            this.masterCreatePeerConnection(id);
        })
        this.socket.on('masterId',(id)=>{
            console.log(id);
            this.call(id);
        })
        this.socket.on('identify',(identity, id)=>{
            console.log(identity);
            this.state = identity;
            if(identity == "master") {
                this.socket.on('message',(id, message)=>{
                    console.log(message);
                    if(message){
                        if(message.type==='offer'){
                            console.log("offermessage");
                            this.masterGetOffer(id,message);
                        }else if (message.type==='candidate'){
                            console.log("candidatemessage");
                            let candidate = new RTCIceCandidate({
                                sdpMLineIndex: message.label,
                                candidate: message.candidate
                            })
                            this.masterAddCandidate(id,candidate);
                        }
                    }
                })
            }
            this.start();
        })

        this.socket.on('leave',(roomId, id)=>{
            this.socket.disconnected();
            closePeerConnection();
            this.closeLocal();
            console.log('leave');
        })

        this.socket.emit('join',this.roomId);
        return;
    }
    const slaveCreatePeerConnection = function(){
        if(!this.pc){
            this.pc = new RTCPeerConnection(this.pcConfig);
            this.pc.onicecandidate = (e)=> {
                if(e.candidate){
                    console.log("candidateOn");
                    this.sendMessage('slave',{
                        type:'candidate',
                        label: e.candidate.sdpMLineIndex,
                        id: e.candidate.sdpMid,
                        candidate: e.candidate.candidate
                    })
                }
            }
            this.pc.ontrack = (e)=>{
                console.log("track");
                console.log(e);
                this.localVideo.srcObject = e.streams[0];
            }
            this.socket.on('message',(id, message)=>{
                console.log(message);
                if(message){
                    if(message.type==='answer'){ 
                        console.log("answermessage");
                        this.pc.setRemoteDescription(new RTCSessionDescription(message));
                    }else if (message.type==='candidate'){
                        console.log("candidatemessage");
                        let candidate = new RTCIceCandidate({
                            sdpMLineIndex: message.label,
                            candidate: message.candidate
                        })
                        this.pc.addIceCandidate(candidate).catch();
                    }
                }
            })
        }
    }

    const masterCreatePeerConnection = function(slaveId){
        console.log(slaveId);
        this.peerConnectionCollection[slaveId] = new RTCPeerConnection(this.pcConfig);
        this.pc = this.peerConnectionCollection[slaveId];
        this.pc.onicecandidate = (e)=> {
            if(e.candidate){
                console.log("candidateOn");
                this.sendMessage('slave',{
                    type:'candidate',
                    label: e.candidate.sdpMLineIndex,
                    id: e.candidate.sdpMid,
                    candidate: e.candidate.candidate
                })
            }
        }
        if(this.localStream){
            this.localStream.getTracks().forEach((track)=>{
                this.pc.addTrack(track,this.localStream);
            })
        }
        this.socket.emit('slaveStart',slaveId);
    }

    const closePeerConnection = function(){
        if(this.pc){
            this.pc.close();
            this.pc=null;
        }
    }


    const closeLocal = function(){
        if(this.localStream&&this.localStream.getTracks()){
            this.localStream.getTracks().forEach((track)=>{
                track.stop();
            })
            this.localStream=null;
        }
    }

    const connectSignalServer = function(){
        this.initSocketIO();
    }
    const disconnectSignalServer = function(){
        if(this.socket){
            this.socket.emit('leave',this.roomId);
        }
    }
    const start = function(){
        if(this.state=='master'){
            if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.error("请使用新版浏览器");
                return;
            } else {
                let constraints = {
                    video:true,
                    audio: {
                        echoCancellation: true
                    }
                }
                navigator.mediaDevices.getUserMedia(constraints).then(this.getMediaStream).catch(this.handleErr);
            }
        } else if(this.state=='slave'){
            this.slaveCreatePeerConnection();
            this.socket.emit('ready',this.roomId);
        }
    }
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