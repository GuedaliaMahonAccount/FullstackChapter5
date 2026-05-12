import { Link, useNavigate } from 'react-router-dom';
import useUser from '../hooks/useUser';

const Navbar = ({ breadcrumb }) => {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="nav justify-between">
      <div className="flex gap-2 items-center">
        <Link to="/home" style={{ fontWeight: 600, fontSize: '1.25rem', color: 'var(--primary)' }}>MyApp</Link>
        {breadcrumb && breadcrumb.map((crumb, i) => (
          <span key={i}>
            / {crumb.to ? <Link to={crumb.to} style={{ color: 'var(--primary)' }}>{crumb.label}</Link> : crumb.label}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Link to={`/users/${user.id}/albums`} className="btn-secondary">Albums</Link>
        <Link to={`/users/${user.id}/posts`} className="btn-secondary">Posts</Link>
        <Link to={`/users/${user.id}/todos`} className="btn-secondary">Todos</Link>
        <button onClick={() => navigate(`/home/${user.id}/info`)} className="btn-secondary">Info</button>
        <button onClick={handleLogout} className="btn-danger" style={{ padding: '0.5rem 1rem' }}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
