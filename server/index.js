const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    socket.on('draw', (data) => {
        socket.broadcast.emit('draw', data);
    });

    socket.on('clear', () => {
        socket.broadcast.emit('clear');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
