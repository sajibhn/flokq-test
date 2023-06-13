import Chat from './components/Chats/Chat';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SingleChat from './components/SingleChat/SingleChat';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/chatroom/:id" element={<SingleChat />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
