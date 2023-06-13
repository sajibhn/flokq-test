import express from 'express';
import mysql from 'mysql2';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'welcome to the backend' });
});

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'chatdb',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to database!');
  }
});

app.get('/chats', (req, res) => {
  const q = 'SELECT * FROM chats';
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post('/chats', (req, res) => {
  const { chatName } = req.body;
  const query = 'INSERT INTO chats (chatName) VALUES (?)';
  db.query(query, [chatName], (err, result) => {
    if (err) {
      console.error('Error inserting data into database:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(201).json({ message: 'Data inserted successfully' });
    }
  });
});

// get single chat message
app.get('/chatroom/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT * FROM chat_messages WHERE chatroom_id = ?',
    [id],
    (err, results) => {
      if (err) {
        console.error('Error retrieving messages: ', err);
        res.status(500).send('Error retrieving messages');
        return;
      }
      res.json(results);
    }
  );
});

// save message in the database
const saveMessage = (roomId, message, callback) => {
  connection.query(
    'INSERT INTO messages (room_id, message) VALUES (?, ?)',
    [roomId, message],
    (err, result) => {
      if (err) {
        console.error('Error saving message to database:', err);
        callback(err);
      } else {
        callback(null, result);
      }
    }
  );
};

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', (roomId) => {
    socket.join(roomId);
  });

  socket.on('sendMessage', ({ roomId, message }) => {
    saveMessage(roomId, message, (err, result) => {
      if (err) {
        console.error('Error saving message to database:', err);
      } else {
        io.to(roomId).emit('message', message);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(5000, () => {
  console.log(`server running at ${PORT}`);
});
