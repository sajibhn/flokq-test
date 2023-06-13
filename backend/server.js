import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import {
  createChat,
  getChats,
  getSingleChatMessages,
  saveMessage,
} from './controllers/chatController.js';

const app = express();
app.use(express.json());

var whitelist = ['http://localhost:5173'];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.json({ message: 'welcome to the backend' });
});

app.get('/chats', getChats);

app.post('/chats', createChat);

app.get('/chatroom/:id', getSingleChatMessages);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`Client ${socket.id} connected`);

  // Join a conversation
  const { roomId } = socket.handshake.query;
  socket.join(roomId);

  socket.on('sendMessage', ({ roomId, message }) => {
    saveMessage(roomId, message, (err, chatMessage) => {
      if (err) {
        console.error('Error saving message to database:', err);
      } else {
        io.to(roomId).emit('sendMessage', chatMessage.dataValues);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`server running at ${PORT}`);
});
