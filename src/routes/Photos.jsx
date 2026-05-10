import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const Photos = () => {
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [user] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const navigate = useNavigate();
  const { userId, albumId, photoId } = useParams();

  // Derive the selected photo directly from the URL param — no state needed
  const selectedPhoto = photoId
    ? photos.find(p => p.id.toString() === photoId) || null
    : null;

  const closeModal = () => navigate(`/users/${userId}/albums/${albumId}/photos`);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.id.toString() !== userId) {
      navigate(`/users/${user.id}/albums`);
      return;
    }

    const loadData = async () => {
      try {
        const [albumRes, photosRes] = await Promise.all([
          fetch(`http://localhost:3000/albums/${albumId}`),
          fetch(`http://localhost:3000/photos?albumId=${albumId}`)
        ]);
        const albumData = await albumRes.json();
        const photosData = await photosRes.json();

        if (!albumData.id || albumData.userId.toString() !== user.id.toString()) {
          navigate(`/users/${user.id}/albums`);
          return;
        }

        setAlbum(albumData);
        setPhotos(photosData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, userId, albumId, user]);

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newPhotoTitle.trim() || !newPhotoUrl.trim()) return;

    const newPhoto = {
      albumId: Number(albumId),
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
      console.error('Error adding photo:', error);
    }
  };

  const handleDeletePhoto = async (id) => {
    try {
      await fetch(`http://localhost:3000/photos/${id}`, { method: 'DELETE' });
      setPhotos(photos.filter(p => p.id !== id));
      if (photoId === id.toString()) closeModal();
    } catch (error) {
      console.error('Error deleting photo:', error);
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
      console.error('Error updating photo:', error);
    }
  };

  const visiblePhotos = photos.slice(0, visibleCount);

  if (loading) return <div className="text-center mt-4">Loading...</div>;

  return (
    <div className="container min-h-screen">
      <nav className="nav justify-between">
        <div className="flex gap-2 items-center">
          <Link to="/home" style={{ fontWeight: 600, fontSize: '1.25rem', color: 'var(--primary)' }}>MyApp</Link>
          <span>/ <Link to={`/users/${userId}/albums`} style={{ color: 'var(--primary)' }}>Albums</Link></span>
          <span>/ Photos</span>
        </div>
        <div className="flex gap-2">
          <Link to={`/users/${userId}/albums`} className="btn-secondary">Back to Albums</Link>
        </div>
      </nav>

      <div className="card">
        {album && (
          <div style={{ marginBottom: '2rem' }}>
            <h1 className="title" style={{ fontSize: '1.75rem' }}>{album.title}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
          </div>
        )}

        <form onSubmit={handleAddPhoto} className="flex gap-2 mb-6" style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '12px' }}>
          <input
            type="text"
            className="input"
            placeholder="Photo title"
            value={newPhotoTitle}
            onChange={e => setNewPhotoTitle(e.target.value)}
            style={{ marginBottom: 0, flex: 1 }}
            required
          />
          <input
            type="url"
            className="input"
            placeholder="Photo URL (https://...)"
            value={newPhotoUrl}
            onChange={e => setNewPhotoUrl(e.target.value)}
            style={{ marginBottom: 0, flex: 2 }}
            required
          />
          <button type="submit" className="btn" style={{ width: 'auto' }}>Add Photo</button>
        </form>

        {photos.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No photos in this album yet.</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
              {visiblePhotos.map(photo => (
                <div key={photo.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <img
                    src={photo.thumbnailUrl && photo.thumbnailUrl.includes('via.placeholder.com')
                      ? `https://picsum.photos/160/160?random=${photo.id}`
                      : (photo.thumbnailUrl || photo.url)}
                    alt={photo.title}
                    style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                    onError={(e) => { e.target.src = 'https://picsum.photos/160/160?blur=2'; }}
                    onClick={() => navigate(`/users/${userId}/albums/${albumId}/photos/${photo.id}`)}
                  />
                  <div style={{ padding: '0.5rem', background: 'var(--bg)' }}>
                    <input
                      type="text"
                      value={photo.title}
                      onChange={(e) => handleUpdatePhotoTitle(photo.id, e.target.value)}
                      className="input"
                      style={{ padding: '0.25rem', marginBottom: '0.5rem', fontSize: '0.75rem' }}
                    />
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="btn-danger"
                      style={{ padding: '0.25rem', fontSize: '0.75rem', width: '100%' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < photos.length && (
              <button
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="btn-secondary w-full mt-4"
              >
                Load More Photos ({photos.length - visibleCount} remaining)
              </button>
            )}
          </>
        )}
      </div>

      {selectedPhoto && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', textAlign: 'center' }}>
            <img
              src={selectedPhoto.url && selectedPhoto.url.includes('via.placeholder.com')
                ? `https://picsum.photos/600/400?random=${selectedPhoto.id}`
                : selectedPhoto.url}
              alt={selectedPhoto.title}
              style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '12px', display: 'block' }}
              onError={(e) => { e.target.src = 'https://picsum.photos/600/400?blur=2'; }}
            />
            <p style={{ marginTop: '1rem', fontWeight: 500 }}>{selectedPhoto.title}</p>
            <button onClick={closeModal} className="btn mt-4" style={{ width: 'auto' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;
