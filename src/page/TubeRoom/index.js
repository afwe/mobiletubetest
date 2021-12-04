import React,{ useState, useEffect, componentDidMount, componentWillUnmount } from 'react';
import {
    Container,
} from './style';
import { CSSTransition } from 'react-transition-group';
import Head from '../../header/index';
import io from 'socket.io-client';
class TubeRoom extends React.Component{
    constructor(props){
        super(props);
        this.roomId = '';
        this.showStatus = true;
        this.socket = {};
        this.pc = null;
        this.localStream = {};
        this.peerConnectionCollection = [];
        this.state = 'slave';
        this.localVideo = {};
        this.localStream = {};
        this.pcConfig = {
            iceServers:[
                {
                    urls: ["stun:afweshuaige.ltd:3478"]
                },
                {
                    urls: ['turn:afweshuaige.ltd:3478?transport=udp'],
                    credential: '1234',
                    username: 'afwe',
                }
            ],
        };
        this.domCollection = {};
        this.startX = 0;
        this.endX = 0;        
        this.roomId = props.location.pathname.substr(6,props.location.pathname.length-1);
    }
    componentDidMount(){
        this.socket = io('wss://175.27.138.160');
        this.localVideo = document.querySelector('video');
        this.connectSignalServer();
    }
    componentWillUnmount(){
        this.disconnectSignalServer();
    }
    handleErr(err){
        console.error(err);
    }
    sendMessage(id,data){
        if(this.socket){
            this.socket.emit('message',id,data);
        }
    }
    getOffer(desc,masterId){
        this.pc.setLocalDescription(desc);
        this.sendMessage(masterId,desc);
    }
    call(masterId){
        if(this.pc){
            console.log('pcsurvive');
            let options = {
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 1
            }
            if(this.state == 'slave'){
                console.log('offercall');
                console.log(this.pc);
                this.pc.createOffer(options)
                .then((desc)=>{
                    this.getOffer(desc,masterId);
                })
                .catch(this.handleErr)
            }
        }
    }

    masterGetOffer(id,message){
        console.log(id);
        this.peerConnectionCollection[id].setRemoteDescription(new RTCSessionDescription(message));
        this.peerConnectionCollection[id].createAnswer().then((answer)=>{this.getAnswer(answer,id)}).catch(this.handleErr);
    }
    masterAddCandidate(id,candidate){
        this.peerConnectionCollection[id].addIceCandidate(candidate).catch();
    }
    getAnswer(desc,id){
        this.peerConnectionCollection[id].setLocalDescription(desc);
        this.sendMessage(id,desc);
    }
    initSocketIO(){
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
            this.closePeerConnection();
            this.closeLocal();
            console.log('leave');
        })

        this.socket.emit('join',this.roomId);
        return;
    }
    slaveCreatePeerConnection(){
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
                        this.pc.addIceCandidate(candidate).catch(this.handleErr);
                    }
                }
            })
        }
    }

    masterCreatePeerConnection(slaveId){
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

    closePeerConnection(){
        if(this.pc){
            this.pc.close();
            this.pc=null;
        }
    }


    closeLocal(){
        if(this.localStream&&this.localStream.getTracks()){
            this.localStream.getTracks().forEach((track)=>{
                track.stop();
            })
            this.localStream=null;
        }
    }

    connectSignalServer(){
        this.initSocketIO();
    }
    disconnectSignalServer(){
        if(this.socket){
            this.socket.emit('leave',this.roomId);
        }
    }
    start(){
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
                let self = this;
                navigator.mediaDevices.getUserMedia(constraints).then((stream)=>{
                    self.localStream = stream;
                    self.localVideo.srcObject = self.localStream;
                }).catch(this.handleErr);
            }
        } else if(this.state=='slave'){
            this.slaveCreatePeerConnection();
            this.socket.emit('ready',this.roomId);
        }
    }
    handleBack = ()=>{
        this.showStatus = false;
    }
    handleTouchStart = (e)=>{
        console.log("TOUCH");
        this.startX = e.touches[0].clientX;
    }
    handleTouchMove = (e)=>{
        this.endX = e.touches[0].clientX;
    }
    handleTouchEnd = (e)=>{
        console.log(this.endX - this.startX);
        if(this.endX - this.startX > 120) {
            this.showStatus = false;
        }
    } 
    render(){
        return(
            <CSSTransition
                in={this.showStatus}  
                timeout={300} 
                classNames="fly" 
                appear={true} 
                unmountOnExit
                onExited={this.props.history.goBack}
                onTouchStart={this.handleTouchStart} onTouchMove ={this.handleTouchMove} onTouchEnd={this.handleTouchEnd}
            >
                <Container>
                    <div>观看直播</div>
                    <video autoPlay playsInline>
                    </video>
                </Container>
            </CSSTransition>
        )
    }
}

export default React.memo(TubeRoom);