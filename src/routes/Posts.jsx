import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchId, setSearchId] = useState(sessionStorage.getItem('posts_searchId') || '');
  const [searchTitle, setSearchTitle] = useState(sessionStorage.getItem('posts_searchTitle') || '');

  useEffect(() => {
    sessionStorage.setItem('posts_searchId', searchId);
    sessionStorage.setItem('posts_searchTitle', searchTitle);
  }, [searchId, searchTitle]);

  // Post management
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');

  // Comments management
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newCommentBody, setNewCommentBody] = useState('');

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
      navigate(`/users/${parsedUser.id}/posts`);
      return;
    }

    fetchPosts(parsedUser.id);
  }, [navigate, userId]);

  const fetchPosts = async (uid) => {
    try {
      const cached = sessionStorage.getItem(`posts_data_${uid}`);
      if (cached) {
        setPosts(JSON.parse(cached));
        setLoading(false);
        return;
      }
      const response = await fetch(`http://localhost:3000/posts?userId=${uid}`);
      const data = await response.json();
      setPosts(data);
      sessionStorage.setItem(`posts_data_${uid}`, JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      sessionStorage.setItem(`posts_data_${user.id}`, JSON.stringify(posts));
    }
  }, [posts, user, loading]);

  const fetchComments = async (postId) => {
    try {
      const cached = sessionStorage.getItem(`comments_data_${postId}`);
      if (cached) {
        setComments(JSON.parse(cached));
        setShowComments(true);
        return;
      }
      const response = await fetch(`http://localhost:3000/comments?postId=${postId}`);
      const data = await response.json();
      setComments(data);
      sessionStorage.setItem(`comments_data_${postId}`, JSON.stringify(data));
      setShowComments(true);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    if (selectedPost && showComments) {
      sessionStorage.setItem(`comments_data_${selectedPost.id}`, JSON.stringify(comments));
    }
  }, [comments, selectedPost, showComments]);

  // POST CRUD
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
      console.error("Error adding post:", error);
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
      console.error("Error updating post:", error);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await fetch(`http://localhost:3000/posts/${id}`, { method: 'DELETE' });
      setPosts(posts.filter(p => p.id !== id));
      if (selectedPost && selectedPost.id === id) {
        setSelectedPost(null);
        setShowComments(false);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // COMMENT CRUD
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentBody.trim() || !selectedPost) return;

    // Use current user's email for identifying their comments
    const newComment = {
      postId: isNaN(Number(selectedPost.id)) ? selectedPost.id : Number(selectedPost.id),
      name: user.name,
      email: user.email,
      body: newCommentBody
    };

    try {
      const response = await fetch('http://localhost:3000/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment)
      });
      const data = await response.json();
      setComments([...comments, data]);
      setNewCommentBody('');
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await fetch(`http://localhost:3000/comments/${id}`, { method: 'DELETE' });
      setComments(comments.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleUpdateComment = async (id, newBody) => {
    try {
      const response = await fetch(`http://localhost:3000/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newBody })
      });
      if (response.ok) {
        setComments(comments.map(c => c.id === id ? { ...c, body: newBody } : c));
      }
    } catch (error) {
      console.error("Error updating comment:", error);
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
          <button onClick={() => { localStorage.removeItem('currentUser'); navigate('/login'); }} className="btn-danger" style={{color: 'white', padding: '0.5rem 1rem'}}>Logout</button>
        </div>
      </nav>

      <div className="split-layout">
        {/* Left side: Posts List */}
        <div className="card">
          <h1 className="title mb-6">My Posts</h1>

          <div className="flex gap-2 mb-4">
            <input type="text" className="input" placeholder="Search by ID..." value={searchId} onChange={e => setSearchId(e.target.value)} style={{ marginBottom: 0, width: '30%' }} />
            <input type="text" className="input" placeholder="Search by Title..." value={searchTitle} onChange={e => setSearchTitle(e.target.value)} style={{ marginBottom: 0, flex: 1 }} />
          </div>

          <form onSubmit={handleAddPost} className="flex-col gap-2 mb-6" style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '8px' }}>
            <input type="text" className="input" placeholder="New post title" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} style={{ marginBottom: 0 }} />
            <textarea className="input" placeholder="New post content" value={newPostBody} onChange={e => setNewPostBody(e.target.value)} rows={3} style={{ marginBottom: 0 }}></textarea>
            <button type="submit" className="btn">Create Post</button>
          </form>

          <div className="flex-col gap-2">
            {filteredPosts.map(post => (
              <div key={post.id}
                style={{
                  padding: '1rem',
                  border: selectedPost?.id === post.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedPost?.id === post.id ? 'rgba(99, 102, 241, 0.05)' : 'var(--surface)'
                }}
                onClick={() => setSelectedPost(post)}>
                <div className="flex justify-between items-start">
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'block' }}>#{post.id}</span>
                    <strong>{post.title}</strong>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }} className="btn-danger" style={{ padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Selected Post Details */}
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

            {!showComments ? (
              <button onClick={() => fetchComments(selectedPost.id)} className="btn-secondary w-full">Show Comments</button>
            ) : (
              <div>
                <h3 className="title mb-4" style={{ fontSize: '1.25rem' }}>Comments</h3>

                <div className="flex-col gap-2 mb-4" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {comments.map(c => {
                    const isMyComment = c.email === user.email;
                    return (
                      <div key={c.id} style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                        <div className="flex justify-between mb-2">
                          <strong>{c.name}</strong>
                          {isMyComment && (
                            <button onClick={() => handleDeleteComment(c.id)} className="btn-danger" style={{ padding: '0.2rem 0.5rem', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '0.75rem' }}>Del</button>
                          )}
                        </div>
                        {isMyComment ? (
                          <input
                            className="input"
                            style={{ padding: '0.25rem', marginBottom: 0, fontSize: '0.85rem' }}
                            value={c.body}
                            onChange={(e) => handleUpdateComment(c.id, e.target.value)}
                          />
                        ) : (
                          <p style={{ margin: 0 }}>{c.body}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input type="text" className="input" placeholder="Write a comment..." value={newCommentBody} onChange={e => setNewCommentBody(e.target.value)} style={{ marginBottom: 0 }} />
                  <button type="submit" className="btn" style={{ width: 'auto' }}>Send</button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;
