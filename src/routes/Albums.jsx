import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [user] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const [searchId, setSearchId] = useState(sessionStorage.getItem('albums_searchId') || '');
  const [searchTitle, setSearchTitle] = useState(sessionStorage.getItem('albums_searchTitle') || '');

  const [newAlbumTitle, setNewAlbumTitle] = useState('');

  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    sessionStorage.setItem('albums_searchId', searchId);
    sessionStorage.setItem('albums_searchTitle', searchTitle);
  }, [searchId, searchTitle]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.id.toString() !== userId) {
      navigate(`/users/${user.id}/albums`);
      return;
    }

    const loadAlbums = async () => {
      try {
        const cached = sessionStorage.getItem(`albums_data_${user.id}`);
        if (cached) {
          setAlbums(JSON.parse(cached));
          setLoading(false);
          return;
        }
        const response = await fetch(`http://localhost:3000/albums?userId=${user.id}`);
        const data = await response.json();
        setAlbums(data);
        sessionStorage.setItem(`albums_data_${user.id}`, JSON.stringify(data));
      } catch (error) {
        console.error('Error fetching albums:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAlbums();
  }, [navigate, userId, user]);

  useEffect(() => {
    if (user && !loading) {
      sessionStorage.setItem(`albums_data_${user.id}`, JSON.stringify(albums));
    }
  }, [albums, user, loading]);

  const handleAddAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;

    const newAlbum = {
      userId: isNaN(Number(user.id)) ? user.id : Number(user.id),
      title: newAlbumTitle
    };

    try {
      const response = await fetch('http://localhost:3000/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlbum)
      });
      const data = await response.json();
      setAlbums([...albums, data]);
      setNewAlbumTitle('');
    } catch (error) {
      console.error('Error adding album:', error);
    }
  };

  const handleDeleteAlbum = async (id) => {
    try {
      await fetch(`http://localhost:3000/albums/${id}`, { method: 'DELETE' });
      setAlbums(albums.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting album:', error);
    }
  };

  const filteredAlbums = albums.filter(a => {
    const matchId = searchId === '' || a.id.toString().includes(searchId);
    const matchTitle = searchTitle === '' || a.title.toLowerCase().includes(searchTitle.toLowerCase());
    return matchId && matchTitle;
  });

  if (loading) return <div className="text-center mt-4">Loading...</div>;

  return (
    <div className="container min-h-screen">
      <nav className="nav justify-between">
        <div className="flex gap-2 items-center">
          <Link to="/home" style={{ fontWeight: 600, fontSize: '1.25rem', color: 'var(--primary)' }}>MyApp</Link>
          <span>/ Albums</span>
        </div>
        <div className="flex gap-2">
          <Link to="/home" className="btn-secondary">Back to Home</Link>
        </div>
      </nav>

      <div className="card">
        <h1 className="title mb-6">My Albums</h1>

        <div className="flex gap-2 mb-4">
          <input type="text" className="input" placeholder="Search by ID..." value={searchId} onChange={e => setSearchId(e.target.value)} style={{ marginBottom: 0, width: '30%' }} />
          <input type="text" className="input" placeholder="Search by Title..." value={searchTitle} onChange={e => setSearchTitle(e.target.value)} style={{ marginBottom: 0, flex: 1 }} />
        </div>

        <form onSubmit={handleAddAlbum} className="flex gap-2 mb-6" style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '8px' }}>
          <input type="text" className="input" placeholder="New album title" value={newAlbumTitle} onChange={e => setNewAlbumTitle(e.target.value)} style={{ marginBottom: 0 }} />
          <button type="submit" className="btn" style={{ width: 'auto' }}>Add</button>
        </form>

        <div className="flex-col gap-2">
          {filteredAlbums.map(album => (
            <div
              key={album.id}
              style={{
                padding: '1rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--surface)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'block' }}>#{album.id}</span>
                <strong>{album.title}</strong>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/users/${userId}/albums/${album.id}/photos`}
                  className="btn-secondary"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}
                >
                  View Photos
                </Link>
                <button
                  onClick={() => handleDeleteAlbum(album.id)}
                  className="btn-danger"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', width: 'auto' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Albums;
