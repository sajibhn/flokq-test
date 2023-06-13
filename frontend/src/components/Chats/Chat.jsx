import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const App = () => {
  const [chats, setChats] = useState([]);
  const [chatName, setChatName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get('http://localhost:4000/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Error retrieving chats:', error);
    }
  };

  const createChat = async () => {
    try {
      await axios.post('http://localhost:4000/chats', { chatName });
      setChatName('');
      fetchChats();
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Chat Name"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
        />
        <button onClick={createChat}>Create Chat</button>
      </div>
      <h2>Chats:</h2>
      <ul>
        {chats.map((chat) => (
          <li key={chat.id} onClick={() => navigate(`/chatroom/${chat.id}`)}>
            {chat.chatName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
