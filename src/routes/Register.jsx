import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== verifyPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Check if username already exists
      const response = await fetch(`http://localhost:3000/users?username=${username}`);
      const users = await response.json();

      if (users.length > 0) {
        setError('Username already exists. Please choose another one.');
      } else {
        // Move to the next screen to fill in details
        // We pass the username and password in the state via navigation
        navigate('/register/details', { state: { username, password } });
      }
    } catch (err) {
      setError('Error connecting to server. Please ensure JSON server is running.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="card max-w-md w-full">
        <h1 className="title text-center">Create Account</h1>
        <p className="subtitle text-center">Sign up to get started.</p>
        
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

          <div>
            <label htmlFor="verifyPassword">Verify Password</label>
            <input
              id="verifyPassword"
              type="password"
              className="input mt-4"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn mt-4">Continue</button>
        </form>

        <p className="text-center mt-4">
          Already have an account? <Link to="/login" style={{color: 'var(--primary)'}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
