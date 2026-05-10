import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useUser from '../hooks/useUser';

const UserDetailsSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [suite, setSuite] = useState('');
  const [city, setCity] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();

  useEffect(() => {
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
      address: {
        street,
        suite,
        city,
        zipcode,
        geo: { lat: '0', lng: '0' }
      },
      phone,
      website: password,
      company: {
        name: companyName,
        catchPhrase: '',
        bs: ''
      }
    };

    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const savedUser = await response.json();
        login(savedUser);
        navigate('/home');
      } else {
        setError('Failed to create user');
      }
    } catch {
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
            <input id="name" type="text" className="input mt-4" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" className="input mt-4" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="tel" className="input mt-4" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="street">Street</label>
            <input id="street" type="text" className="input mt-4" value={street} onChange={(e) => setStreet(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="suite">Suite / Apt</label>
            <input id="suite" type="text" className="input mt-4" value={suite} onChange={(e) => setSuite(e.target.value)} />
          </div>
          <div>
            <label htmlFor="city">City</label>
            <input id="city" type="text" className="input mt-4" value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="zipcode">Zip Code</label>
            <input id="zipcode" type="text" className="input mt-4" value={zipcode} onChange={(e) => setZipcode(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="companyName">Company Name</label>
            <input id="companyName" type="text" className="input mt-4" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
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
