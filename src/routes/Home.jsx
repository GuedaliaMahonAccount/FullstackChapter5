import { useEffect } from 'react';
import { useNavigate, Link, useMatch } from 'react-router-dom';
import useUser from '../hooks/useUser';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const infoMatch = useMatch('/home/:userId/info');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="container min-h-screen">
      <nav className="nav justify-between">
        <div className="flex gap-2 items-center">
          <span style={{ fontWeight: 600, fontSize: '1.25rem', color: 'var(--primary)' }}>MyApp</span>
        </div>
        <div className="flex gap-2">
          <Link to={`/users/${user.id}/albums`} className="btn-secondary">Albums</Link>
          <Link to={`/users/${user.id}/posts`} className="btn-secondary">Posts</Link>
          <Link to={`/users/${user.id}/todos`} className="btn-secondary">Todos</Link>
          <button onClick={() => navigate(`/home/${user.id}/info`)} className="btn-secondary">Info</button>
          <button onClick={handleLogout} className="btn-danger" style={{ padding: '0.5rem 1rem' }}>Logout</button>
        </div>
      </nav>

      <div className="card text-center" style={{ marginTop: '4rem' }}>
        <h1 className="title">Welcome, {user.name}!</h1>
        <p className="subtitle">What would you like to do today?</p>
        <div className="flex justify-center gap-4 mt-4" style={{ flexWrap: 'wrap' }}>
          <Link to={`/users/${user.id}/albums`} className="btn" style={{ width: 'auto' }}>View Albums</Link>
          <Link to={`/users/${user.id}/posts`} className="btn" style={{ width: 'auto' }}>Read Posts</Link>
          <Link to={`/users/${user.id}/todos`} className="btn" style={{ width: 'auto' }}>Manage Todos</Link>
        </div>
      </div>

      {infoMatch && (
        <div className="modal-overlay" onClick={() => navigate('/home')}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="title mb-4">User Information</h2>
            <div className="flex-col gap-2">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
              <p><strong>City:</strong> {user.address?.city}</p>
              <p><strong>Company:</strong> {user.company?.name}</p>
              <p><strong>ID:</strong> {user.id}</p>
            </div>
            <button onClick={() => navigate('/home')} className="btn mt-4">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
