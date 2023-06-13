import { Sequelize, DataTypes } from 'sequelize';

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

// get all chats

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.findAll();
    res.json(chats);
  } catch (err) {
    console.error('Error retrieving chats:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// create a chat

export const createChat = async (req, res) => {
  const { chatName } = req.body;

  try {
    const chat = await Chat.create({ chatName });
    res.status(201).json({ message: 'Data inserted successfully' });
  } catch (err) {
    console.error('Error inserting data into database:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// get single chat messages

export const getSingleChatMessages = async (req, res) => {
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
};

// saved message
export const saveMessage = async (roomId, message, callback) => {
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
