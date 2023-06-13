import { useEffect, useRef, useState } from 'react';
import socketIOClient from 'socket.io-client';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const NEW_CHAT_MESSAGE_EVENT = 'sendMessage';
const SOCKET_SERVER_URL = 'http://localhost:4000';

const SingleChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef();
  const scrollRef = useRef();
  const { id: roomId } = useParams();

  useEffect(() => {
    fetchChats();
  }, [roomId]);

  const fetchChats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/chatroom/${roomId}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error retrieving chats:', error);
    }
  };

  useEffect(() => {
    socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
      query: { roomId },
    });

    socketRef.current.on(NEW_CHAT_MESSAGE_EVENT, (message) => {
      console.log(message);
      const incomingMessage = {
        ...message,
      };
      setMessages((messages) => [...messages, incomingMessage]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewMessageChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = () => {
    sendMessage(newMessage);
    setNewMessage('');
  };

  const sendMessage = () => {
    socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
      roomId,
      message: newMessage,
    });
  };
  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-gray-100 text-gray-800 p-10">
      <div className="flex flex-col flex-grow w-full max-w-xl bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="flex flex-col flex-grow h-0 p-4 overflow-auto">
          {messages.map((message, i) => (
            <div key={i} ref={scrollRef}>
              <div className="flex w-full mt-2 space-x-3 max-w-xs"></div>
              <div className="flex w-full mt-2 space-x-3 max-w-xs">
                <div>
                  <div className="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg">
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 leading-none">
                    {moment(message.createdAt).fromNow()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-300 p-4 flex">
          <input
            className="flex items-center h-10 w-full rounded px-3 text-sm"
            type="text"
            placeholder="Type your message…"
            value={newMessage}
            onChange={handleNewMessageChange}
          />
          <button
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-r"
            onClick={handleSendMessage}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleChat;
