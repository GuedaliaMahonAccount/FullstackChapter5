import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const [user, setUser] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="container min-h-screen">
      <nav className="nav justify-between">
        <div className="flex gap-2 items-center">
          <span style={{fontWeight: 600, fontSize: '1.25rem', color: 'var(--primary)'}}>
            MyApp
          </span>
        </div>
        <div className="flex gap-2">
          <Link to={`/users/${user.id}/albums`} className="btn-secondary">Albums</Link>
          <Link to={`/users/${user.id}/posts`} className="btn-secondary">Posts</Link>
          <Link to={`/users/${user.id}/todos`} className="btn-secondary">Todos</Link>
          <button onClick={() => setShowInfo(true)} className="btn-secondary">Info</button>
          <button onClick={handleLogout} className="btn-danger" style={{ padding: '0.5rem 1rem'}}>Logout</button>
        </div>
      </nav>

      <div className="card text-center" style={{marginTop: '4rem'}}>
        <h1 className="title">Welcome, {user.name}!</h1>
        <p className="subtitle">What would you like to do today?</p>
        
        <div className="flex justify-center gap-4 mt-4" style={{flexWrap: 'wrap'}}>
          <Link to={`/users/${user.id}/albums`} className="btn" style={{width: 'auto'}}>View Albums</Link>
          <Link to={`/users/${user.id}/posts`} className="btn" style={{width: 'auto'}}>Read Posts</Link>
          <Link to={`/users/${user.id}/todos`} className="btn" style={{width: 'auto'}}>Manage Todos</Link>
        </div>
      </div>

      {showInfo && (
        <div className="modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="title mb-4">User Information</h2>
            <div className="flex-col gap-2">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
            </div>
            <button onClick={() => setShowInfo(false)} className="btn mt-4">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;