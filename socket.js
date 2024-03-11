const socketIo = require('socket.io');

let io;

function initSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: 'https://65eebe7c38e71118155ec1a9--clinquant-horse-0adb25.netlify.app',
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
