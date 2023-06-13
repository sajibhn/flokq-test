import { useEffect, useRef, useState } from 'react';
import socketIOClient from 'socket.io-client';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const NEW_CHAT_MESSAGE_EVENT = 'sendMessage';
const SOCKET_SERVER_URL = 'http://localhost:4000';

const SingleChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef();
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
    <div className="chat-room-container">
      <h1 className="room-name">Room: {roomId}</h1>
      <div className="messages-container">
        <ol className="messages-list">
          {messages.map((message, i) => (
            <li key={i}>{message.message}</li>
          ))}
        </ol>
      </div>
      <textarea
        value={newMessage}
        onChange={handleNewMessageChange}
        placeholder="Write message..."
        className="new-message-input-field"
      />
      <button onClick={handleSendMessage} className="send-message-button">
        Send
      </button>
    </div>
  );
};

export default SingleChat;
