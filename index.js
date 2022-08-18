const express = require('express');
const process = require('process');
const {v4: uuidv4} = require('uuid');
const { Server } = require('socket.io')
const { createServer } = require('http')
const { ExpressPeerServer } = require('peer')


const app = express(); 
const server = createServer(app); 
const io = new Server(server);

const peerServer = ExpressPeerServer(app)


app.set('view engine', "ejs");

app.use(express.static('public'));

app.use('/peerjs', peerServer);

app.get("/", (req,res)=>{
   
    // res.status(200).send("Hello world")
    res.redirect(`/${uuidv4()}`)
})

app.get("/:roomId", (req,res)=>{
    res.render('room', {roomId: req.params.roomId})
})

io.on('connection', socket=>{
    socket.on('join-room', (roomId, userId)=>{
        console.log(`${userId} has joined`)
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
    })

    socket.on('send-chat', (roomId, name, text)=>{
        console.log(`chat send from: ${name}: ${text}`);
        socket.to(roomId).emit('recieve-chat', name, text);
        socket.emit('recieve-chat', name, text);
    })

    // socket.on('send-chat', (roomId, name, text)=>{
    //     console.log(`chat send from: ${name}: ${text}`);
    //     socket.join(roomId);
    //     socket.to(roomId).emit('recieve-chat', name, text);
    // })
})

server.listen(process.env.PORT ,9090)