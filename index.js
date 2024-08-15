const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const http = require('http');

// Create an Express app and HTTP server
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server);

const peerServer = ExpressPeerServer(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get('/:roomId', (req, res) => {
  res.render('room', { roomId: req.params.roomId });
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    console.log(`${userId} has joined`);
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);
  });

  socket.on('send-chat', (roomId, name, text) => {
    console.log(`Chat sent from: ${name}: ${text}`);
    socket.to(roomId).emit('receive-chat', name, text);
    socket.emit('receive-chat', name, text);
  });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});