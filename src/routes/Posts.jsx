import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [user] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const [searchId, setSearchId] = useState(sessionStorage.getItem('posts_searchId') || '');
  const [searchTitle, setSearchTitle] = useState(sessionStorage.getItem('posts_searchTitle') || '');

  const [selectedPost, setSelectedPost] = useState(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');

  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    sessionStorage.setItem('posts_searchId', searchId);
    sessionStorage.setItem('posts_searchTitle', searchTitle);
  }, [searchId, searchTitle]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.id.toString() !== userId) {
      navigate(`/users/${user.id}/posts`);
      return;
    }

    const loadPosts = async () => {
      try {
        const cached = sessionStorage.getItem(`posts_data_${user.id}`);
        if (cached) {
          setPosts(JSON.parse(cached));
          setLoading(false);
          return;
        }
        const response = await fetch(`http://localhost:3000/posts?userId=${user.id}`);
        const data = await response.json();
        setPosts(data);
        sessionStorage.setItem(`posts_data_${user.id}`, JSON.stringify(data));
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [navigate, userId, user]);

  useEffect(() => {
    if (user && !loading) {
      sessionStorage.setItem(`posts_data_${user.id}`, JSON.stringify(posts));
    }
  }, [posts, user, loading]);

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostBody.trim()) return;

    const newPost = {
      userId: isNaN(Number(user.id)) ? user.id : Number(user.id),
      title: newPostTitle,
      body: newPostBody
    };

    try {
      const response = await fetch('http://localhost:3000/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      const data = await response.json();
      setPosts([...posts, data]);
      setNewPostTitle('');
      setNewPostBody('');
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const handleUpdatePost = async (post, newBody) => {
    try {
      const response = await fetch(`http://localhost:3000/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newBody })
      });
      if (response.ok) {
        setPosts(posts.map(p => p.id === post.id ? { ...p, body: newBody } : p));
        if (selectedPost && selectedPost.id === post.id) {
          setSelectedPost({ ...selectedPost, body: newBody });
        }
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await fetch(`http://localhost:3000/posts/${id}`, { method: 'DELETE' });
      setPosts(posts.filter(p => p.id !== id));
      if (selectedPost && selectedPost.id === id) {
        setSelectedPost(null);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchId = searchId === '' || p.id.toString().includes(searchId);
    const matchTitle = searchTitle === '' || p.title.toLowerCase().includes(searchTitle.toLowerCase());
    return matchId && matchTitle;
  });

  if (loading) return <div className="text-center mt-4">Loading...</div>;

  return (
    <div className="container min-h-screen">
      <nav className="nav justify-between">
        <div className="flex gap-2 items-center">
          <Link to="/home" style={{ fontWeight: 600, fontSize: '1.25rem', color: 'var(--primary)' }}>MyApp</Link>
          <span>/ Posts</span>
        </div>
        <div className="flex gap-2">
          <Link to="/home" className="btn-secondary">Back to Home</Link>
          <button onClick={() => { localStorage.removeItem('currentUser'); navigate('/login'); }} className="btn-danger" style={{ color: 'white', padding: '0.5rem 1rem' }}>Logout</button>
        </div>
      </nav>

      <div className="split-layout">
        {/* Left: Posts list */}
        <div className="card">
          <h1 className="title mb-6">My Posts</h1>

          <div className="flex gap-2 mb-4">
            <input type="text" className="input" placeholder="Search by ID..." value={searchId} onChange={e => setSearchId(e.target.value)} style={{ marginBottom: 0, width: '30%' }} />
            <input type="text" className="input" placeholder="Search by Title..." value={searchTitle} onChange={e => setSearchTitle(e.target.value)} style={{ marginBottom: 0, flex: 1 }} />
          </div>

          <form onSubmit={handleAddPost} className="flex-col gap-2 mb-6" style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '8px' }}>
            <input type="text" className="input" placeholder="New post title" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} style={{ marginBottom: 0 }} />
            <textarea className="input" placeholder="New post content" value={newPostBody} onChange={e => setNewPostBody(e.target.value)} rows={3} style={{ marginBottom: 0 }} />
            <button type="submit" className="btn">Create Post</button>
          </form>

          <div className="flex-col gap-2">
            {filteredPosts.map(post => (
              <div
                key={post.id}
                style={{
                  padding: '1rem',
                  border: selectedPost?.id === post.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedPost?.id === post.id ? 'rgba(99, 102, 241, 0.05)' : 'var(--surface)'
                }}
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'block' }}>#{post.id}</span>
                    <strong>{post.title}</strong>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                    className="btn-danger"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected post detail */}
        {selectedPost && (
          <div className="card" style={{ position: 'sticky', top: '2rem' }}>
            <h2 className="title" style={{ fontSize: '1.5rem' }}>{selectedPost.title}</h2>
            <div className="mt-4 mb-4">
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Edit Content:</label>
              <textarea
                className="input"
                value={selectedPost.body}
                onChange={(e) => handleUpdatePost(selectedPost, e.target.value)}
                rows={5}
              />
            </div>
            <Link
              to={`/users/${userId}/posts/${selectedPost.id}/comments`}
              className="btn-secondary w-full"
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              View Comments
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;
