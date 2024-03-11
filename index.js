const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const videoRoutes = require('./routes/video');
const commentsRoutes = require('./routes/comments');
const chanelRoutes = require('./routes/chanel');
const dbConnect = require('./config/database');
const { initSocket } = require('./socket');
const dotenv = require("dotenv");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

dotenv.config();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use('/uploads', express.static(path.join('uploads')));
app.get('/', (req, res) => {
    res.send("hello");
});
app.use(bodyParser.json());
app.use('/user', userRoutes);
app.use('/video', videoRoutes);
app.use('/comment', commentsRoutes);
app.use('/chanel', chanelRoutes);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

dbConnect();

module.exports = { server, io }; // Export server and io
