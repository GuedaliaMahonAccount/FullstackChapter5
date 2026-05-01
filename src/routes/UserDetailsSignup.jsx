import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const UserDetailsSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user arrived here without going through the register page, redirect
    if (!location.state || !location.state.username || !location.state.password) {
      navigate('/register');
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { username, password } = location.state;

    const newUser = {
      name,
      username,
      email,
      website: password // Project instruction: use website field as password
    };

    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const savedUser = await response.json();
        // Log them in immediately and redirect to home
        localStorage.setItem('currentUser', JSON.stringify(savedUser));
        navigate('/home');
      } else {
        setError('Failed to create user');
      }
    } catch (err) {
      setError('Error connecting to server. Please ensure JSON server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!location.state) return null;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="card max-w-md w-full">
        <h1 className="title text-center">Complete Profile</h1>
        <p className="subtitle text-center">Tell us a bit more about yourself.</p>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex-col">
          <div>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="input mt-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input mt-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn mt-4" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Finish Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserDetailsSignup;
