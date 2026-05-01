import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './routes/Login';
import Register from './routes/Register';
import UserDetailsSignup from './routes/UserDetailsSignup';
import Home from './routes/Home';
import Todos from './routes/Todos';
import Posts from './routes/Posts';
import Albums from './routes/Albums';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/details" element={<UserDetailsSignup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/users/:userId/todos" element={<Todos />} />
      <Route path="/users/:userId/posts" element={<Posts />} />
      <Route path="/users/:userId/albums" element={<Albums />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
