import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchId, setSearchId] = useState(sessionStorage.getItem('albums_searchId') || '');
  const [searchTitle, setSearchTitle] = useState(sessionStorage.getItem('albums_searchTitle') || '');

  useEffect(() => {
    sessionStorage.setItem('albums_searchId', searchId);
    sessionStorage.setItem('albums_searchTitle', searchTitle);
  }, [searchId, searchTitle]);

  // Album management
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');

  // Photos management
  const [photos, setPhotos] = useState([]);
  const [visiblePhotosCount, setVisiblePhotosCount] = useState(10);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    if (parsedUser.id.toString() !== userId) {
      navigate(`/users/${parsedUser.id}/albums`);
      return;
    }

    fetchAlbums(parsedUser.id);
  }, [navigate, userId]);

  const fetchAlbums = async (uid) => {
    try {
      const cached = sessionStorage.getItem(`albums_data_${uid}`);
      if (cached) {
        setAlbums(JSON.parse(cached));
        setLoading(false);
        return;
      }
      const response = await fetch(`http://localhost:3000/albums?userId=${uid}`);
      const data = await response.json();
      setAlbums(data);
      sessionStorage.setItem(`albums_data_${uid}`, JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      sessionStorage.setItem(`albums_data_${user.id}`, JSON.stringify(albums));
    }
  }, [albums, user, loading]);

  const fetchPhotos = async (albumId) => {
    try {
      const cached = sessionStorage.getItem(`photos_data_${albumId}`);
      if (cached) {
        setPhotos(JSON.parse(cached));
        setVisiblePhotosCount(10);
        return;
      }
      const response = await fetch(`http://localhost:3000/photos?albumId=${albumId}`);
      const data = await response.json();
      setPhotos(data);
      sessionStorage.setItem(`photos_data_${albumId}`, JSON.stringify(data));
      setVisiblePhotosCount(10); // reset pagination
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  useEffect(() => {
    if (selectedAlbum) {
      sessionStorage.setItem(`photos_data_${selectedAlbum.id}`, JSON.stringify(photos));
    }
  }, [photos, selectedAlbum]);

  // ALBUM CRUD
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
      console.error("Error adding album:", error);
    }
  };

  // PHOTO CRUD
  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newPhotoTitle.trim() || !newPhotoUrl.trim() || !selectedAlbum) return;

    const newPhoto = { 
      albumId: isNaN(Number(selectedAlbum.id)) ? selectedAlbum.id : Number(selectedAlbum.id), 
      title: newPhotoTitle,
      url: newPhotoUrl,
      thumbnailUrl: newPhotoUrl
    };

    try {
      const response = await fetch('http://localhost:3000/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhoto)
      });
      const data = await response.json();
      setPhotos([data, ...photos]);
      setNewPhotoTitle('');
      setNewPhotoUrl('');
    } catch (error) {
      console.error("Error adding photo:", error);
    }
  };

  const handleDeletePhoto = async (id) => {
    try {
      await fetch(`http://localhost:3000/photos/${id}`, { method: 'DELETE' });
      setPhotos(photos.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };

  const handleUpdatePhotoTitle = async (id, newTitle) => {
    try {
      const response = await fetch(`http://localhost:3000/photos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      if (response.ok) {
        setPhotos(photos.map(p => p.id === id ? { ...p, title: newTitle } : p));
      }
    } catch (error) {
      console.error("Error updating photo:", error);
    }
  };

  const filteredAlbums = albums.filter(a => {
    const matchId = searchId === '' || a.id.toString().includes(searchId);
    const matchTitle = searchTitle === '' || a.title.toLowerCase().includes(searchTitle.toLowerCase());
    return matchId && matchTitle;
  });

  const visiblePhotos = photos.slice(0, visiblePhotosCount);

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

      <div className="split-layout">
        {/* Left side: Albums List */}
        <div className="card" style={{ minWidth: '300px' }}>
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
              <div key={album.id}
                style={{
                  padding: '1rem',
                  border: selectedAlbum?.id === album.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedAlbum?.id === album.id ? 'rgba(99, 102, 241, 0.05)' : 'var(--surface)'
                }}
                onClick={() => {
                  setSelectedAlbum(album);
                  fetchPhotos(album.id);
                }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'block' }}>#{album.id}</span>
                <strong>{album.title}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Photos in Selected Album */}
        {selectedAlbum && (
          <div className="card">
            <h2 className="title">{selectedAlbum.title}</h2>

            <form onSubmit={handleAddPhoto} className="flex gap-2 mb-6 mt-4">
              <input type="text" className="input" placeholder="New photo title" value={newPhotoTitle} onChange={e => setNewPhotoTitle(e.target.value)} style={{marginBottom: 0, flex: 1}} required />
              <input type="url" className="input" placeholder="Photo URL (http://...)" value={newPhotoUrl} onChange={e => setNewPhotoUrl(e.target.value)} style={{marginBottom: 0, flex: 1}} required />
              <button type="submit" className="btn" style={{width: 'auto'}}>Add Photo</button>
            </form>

            {photos.length === 0 ? (
              <p>No photos in this album.</p>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                  {visiblePhotos.map(photo => (
                    <div key={photo.id} style={{border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden'}}>
                      {/* Using picsum fallback only for original placeholder images, user's URLs are shown directly */}
                      <img 
                        src={photo.thumbnailUrl && photo.thumbnailUrl.includes('via.placeholder.com') ? `https://picsum.photos/150/150?random=${photo.id}` : (photo.thumbnailUrl || photo.url)} 
                        alt={photo.title} 
                        style={{width: '100%', height: '150px', objectFit: 'cover', display: 'block'}} 
                        onError={(e) => { e.target.src = 'https://picsum.photos/150/150?blur=2' }}
                      />
                      <div style={{ padding: '0.5rem', background: 'var(--bg)' }}>
                        <input
                          type="text"
                          value={photo.title}
                          onChange={(e) => handleUpdatePhotoTitle(photo.id, e.target.value)}
                          className="input"
                          style={{ padding: '0.25rem', marginBottom: '0.5rem', fontSize: '0.75rem' }}
                        />
                        <button onClick={() => handleDeletePhoto(photo.id)} className="btn-danger w-full" style={{ padding: '0.25rem', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                {visiblePhotosCount < photos.length && (
                  <button
                    onClick={() => setVisiblePhotosCount(prev => prev + 10)}
                    className="btn-secondary w-full mt-4"
                  >
                    Load More Photos
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Albums;
