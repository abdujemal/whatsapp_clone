// const { default: Peer } = require("peerjs");

const socket = io("/")

var peer = new Peer()

var userName = "User"

document.getElementById("user-name").value = userName

const setUserName = ()=>{
    userName = document.getElementById("user-name").value;
    console.log(userName);
}

const ROOMID = "8f35c599-94a6-455a-a2e7-4252669913c3";

let myVideoStream

const myVideo = document.createElement('video')
const videoContainer = document.getElementById("video-container")

const chatContainer = document.querySelector('.chat-container')


const addVideoStream = (video, stream)=>{
    video.srcObject = stream;

    video.addEventListener('loadedmetadata', ()=>{
        video.play()
    })
    videoContainer.append(video)
}

navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream =>{
        myVideoStream = stream;
        addVideoStream(myVideo, stream);

        peer.on('call', call => {
            console.log("calling...");
            call.answer(stream)
            const vedio = document.createElement('video')
            call.on('stream', userVideoStream => {
                console.log(` is added`);
                addVideoStream(vedio, userVideoStream)
            })
        })

        socket.on('user-connected', (userId)=>{
            connectToUser(userId, stream);
        })
    })

peer.on('open', id => {
    socket.emit('join-room', ROOMID, id)
})

socket.on('recieve-chat', (name, text)=>{
    console.log(`chat send from: ${name}: ${text}`);
    var chat = document.createElement('div')
    chat.innerHTML = `
    <p class="user-name-txt">${name}</p>
    <p>${text}</p>  
    `
    chatContainer.append(chat)
})


const connectToUser = (userId, stream)=>{
    console.log(`${userId} is joined`);
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        console.log(`${userId} is added`);
        addVideoStream(video, userVideoStream)
    })
}

const muteUnmute = ()=>{
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
       
        setMuteButton();
    }else{
        myVideoStream.getAudioTracks()[0].enabled = true;
        setUnmuteButton();
    }
}

const setUnmuteButton = ()=>{
    const html = `
    <i>I</i>
    <span>Mute</span>
    `
    document.querySelector('.mute').classList.remove("red")
    document.querySelector('.mute').innerHTML = html
}

const setMuteButton = ()=>{
    const html = `
    <i>I</i>
    <span>UnMute</span>
    `
    document.querySelector('.mute').classList.add("red")
    document.querySelector('.mute').innerHTML = html
}

const stopStartVideo = ()=>{
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled = false;
        setStopVideoButton();
    }else{
        myVideoStream.getVideoTracks()[0].enabled = true;
        
        setStartVideoButton();
    }
}

const setStartVideoButton = ()=>{
    const html = `
    <i>I</i>
    <span>Stop Vedio</span>
    `
    document.querySelector('.toggle-video').classList.remove("red")
    document.querySelector('.toggle-video').innerHTML = html
}

const setStopVideoButton = ()=>{
    const html = `
    <i>I</i>
    <span>Start Video</span>
    `
    document.querySelector('.toggle-video').classList.add("red")
    document.querySelector('.toggle-video').innerHTML = html
}

const sendChat = ()=>{
    const text = document.getElementById('chat').value;
    socket.emit('send-chat', ROOMID, userName, text);
    document.getElementById('chat').value = ""
}
