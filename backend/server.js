// import express from 'express';
// import mysql from 'mysql2';
// import { Server } from 'socket.io';
// import http from 'http';
// import cors from 'cors';

// const app = express();
// app.use(express.json());

// var whitelist = ['http://localhost:5173'];
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };
// app.use(cors(corsOptions));

// app.get('/', (req, res) => {
//   res.json({ message: 'welcome to the backend' });
// });

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'admin',
//   database: 'chatdb',
// });

// db.connect((err) => {
//   if (err) {
//     console.error('Error connecting to database:', err);
//   } else {
//     console.log('Connected to database!');
//   }
// });

// app.get('/chats', (req, res) => {
//   const q = 'SELECT * FROM chats';
//   db.query(q, (err, data) => {
//     if (err) return res.json(err);
//     return res.json(data);
//   });
// });

// app.post('/chats', (req, res) => {
//   const { chatName } = req.body;
//   const query = 'INSERT INTO chats (chatName) VALUES (?)';
//   db.query(query, [chatName], (err, result) => {
//     if (err) {
//       console.error('Error inserting data into database:', err);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       res.status(201).json({ message: 'Data inserted successfully' });
//     }
//   });
// });

// // get single chat message
// app.get('/chatroom/:id', (req, res) => {
//   const { id } = req.params;
//   db.query(
//     'SELECT * FROM chat_messages WHERE chatroom_id = ?',
//     [id],
//     (err, results) => {
//       if (err) {
//         console.error('Error retrieving messages: ', err);
//         res.status(500).send('Error retrieving messages');
//         return;
//       }
//       res.json(results);
//     }
//   );
// });

// // save message in the database
// const saveMessage = (roomId, message, callback) => {
//   connection.query(
//     'INSERT INTO messages (room_id, message) VALUES (?, ?)',
//     [roomId, message],
//     (err, result) => {
//       if (err) {
//         console.error('Error saving message to database:', err);
//         callback(err);
//       } else {
//         callback(null, result);
//       }
//     }
//   );
// };

// const server = http.createServer(app);
// const io = new Server(server);

// io.on('connection', (socket) => {
//   console.log('A user connected');

//   socket.on('join', (roomId) => {
//     socket.join(roomId);
//   });

//   socket.on('sendMessage', ({ roomId, message }) => {
//     saveMessage(roomId, message, (err, result) => {
//       if (err) {
//         console.error('Error saving message to database:', err);
//       } else {
//         io.to(roomId).emit('message', message);
//       }
//     });
//   });

//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(5000, () => {
//   console.log(`server running at ${PORT}`);
// });

import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';

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

const sequelize = new Sequelize('chatdb', 'root', 'admin', {
  host: 'localhost',
  dialect: 'mysql',
});

// Define your models
const Chat = sequelize.define('chat', {
  chatName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const ChatMessage = sequelize.define('chat_message', {
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Define relationships between models
Chat.hasMany(ChatMessage);
ChatMessage.belongsTo(Chat);

// Sync models with the database
sequelize
  .sync()
  .then(() => {
    console.log('Connected to database and synced models!');
  })
  .catch((err) => {
    console.error('Error connecting to database:', err);
  });

app.get('/chats', async (req, res) => {
  try {
    const chats = await Chat.findAll();
    res.json(chats);
  } catch (err) {
    console.error('Error retrieving chats:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/chats', async (req, res) => {
  const { chatName } = req.body;

  try {
    const chat = await Chat.create({ chatName });
    res.status(201).json({ message: 'Data inserted successfully' });
  } catch (err) {
    console.error('Error inserting data into database:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/chatroom/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const chatMessages = await ChatMessage.findAll({
      where: { chatId: id },
    });
    res.json(chatMessages);
  } catch (err) {
    console.error('Error retrieving chat messages:', err);
    res.status(500).send('Error retrieving chat messages');
  }
});

const saveMessage = async (roomId, message, callback) => {
  try {
    const chatMessage = await ChatMessage.create({
      message,
      chatId: roomId,
    });
    callback(null, chatMessage);
  } catch (err) {
    console.error('Error saving message to database:', err);
    callback(err);
  }
};

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
        console.log(chatMessage.dataValues);
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
