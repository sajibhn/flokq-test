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
    <>
      <div className="flex flex-col items-center justify-center w-screen align-center h-screen  text-gray-800 ">
        <h1 className="text-center p-5 text-5xl mb-10 ">
          Create A New Chat Room Or Join
        </h1>
        <div className="flex flex-col  w-full max-w-xl bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-gray-300 p-4 flex">
            <input
              className="flex items-center h-10 w-full rounded px-3 text-sm"
              type="text"
              placeholder="Chat Name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-r"
              onClick={createChat}
            >
              Create
            </button>
          </div>
        </div>
        <div>
          <ul className="pt-10 flex gap-5">
            {chats.map((chat) => (
              <li
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full cursor-pointer"
                key={chat.id}
                onClick={() => navigate(`/chatroom/${chat.id}`)}
              >
                {chat.chatName}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default App;
