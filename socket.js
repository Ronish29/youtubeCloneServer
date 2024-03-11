const socketIo = require('socket.io');

let io;

function initSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: 'http://localhost:3000',
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected');
    });

    return io;
}

function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
}

module.exports = {
    initSocket,
    getIO
};
