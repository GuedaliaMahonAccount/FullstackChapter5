import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const user = localStorage.getItem('currentUser');
    if (user) {
      navigate('/home');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Fetch users to check credentials
      const response = await fetch(`http://localhost:3000/users?username=${username}`);
      const users = await response.json();

      if (users.length > 0) {
        const user = users[0];
        // The instructions state that the password should match the 'website' field
        if (user.website === password) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          navigate('/home');
        } else {
          setError('Invalid password');
        }
      } else {
        setError('User not found');
      }
    } catch (err) {
      setError('Error connecting to server. Please ensure JSON server is running.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="card max-w-md w-full">
        <h1 className="title text-center">Welcome Back</h1>
        <p className="subtitle text-center">Please enter your details to sign in.</p>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex-col">
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="input mt-4"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input mt-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn mt-4">Sign In</button>
        </form>

        <p className="text-center mt-4">
          Don't have an account? <Link to="/register" style={{color: 'var(--primary)'}}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
