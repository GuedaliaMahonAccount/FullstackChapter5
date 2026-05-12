import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import useUser from '../hooks/useUser';
import Navbar from '../components/Navbar';

const Comments = () => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCommentBody, setNewCommentBody] = useState('');

  const navigate = useNavigate();
  const { userId, postId } = useParams();
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.id.toString() !== userId) {
      navigate(`/users/${user.id}/posts`);
      return;
    }

    const loadData = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`http://localhost:3000/posts/${postId}`),
          fetch(`http://localhost:3000/comments?postId=${postId}`)
        ]);
        const postData = await postRes.json();
        const commentsData = await commentsRes.json();

        if (!postData.id || postData.userId.toString() !== user.id.toString()) {
          navigate(`/users/${user.id}/posts`);
          return;
        }

        setPost(postData);
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, userId, postId, user]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentBody.trim()) return;

    const newComment = {
      postId: Number(postId),
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
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await fetch(`http://localhost:3000/comments/${id}`, { method: 'DELETE' });
      setComments(comments.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting comment:', error);
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
      console.error('Error updating comment:', error);
    }
  };

  if (loading) return <div className="text-center mt-4">Loading...</div>;

  return (
    <div className="container min-h-screen">
      <Navbar breadcrumb={[{ label: 'Posts', to: `/users/${userId}/posts` }, { label: 'Comments' }]} />

      <div className="card">
        {post && (
          <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h1 className="title" style={{ fontSize: '1.75rem' }}>{post.title}</h1>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{post.body}</p>
          </div>
        )}

        <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          Comments ({comments.length})
        </h2>

        <div className="flex-col gap-2" style={{ marginBottom: '2rem' }}>
          {comments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No comments yet. Be the first!</p>
          ) : (
            comments.map(c => {
              const isMyComment = user && c.email === user.email;
              return (
                <div key={c.id} style={{
                  background: 'var(--bg)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: isMyComment ? '1px solid var(--primary-light)' : '1px solid var(--border)'
                }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>{c.name}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>{c.email}</span>
                      {isMyComment && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>You</span>
                      )}
                    </div>
                    {isMyComment && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="btn-danger"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  {isMyComment ? (
                    <input
                      className="input"
                      style={{ padding: '0.5rem', marginBottom: 0, fontSize: '0.9rem' }}
                      value={c.body}
                      onChange={(e) => handleUpdateComment(c.id, e.target.value)}
                    />
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{c.body}</p>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Add a Comment</h3>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              className="input"
              placeholder="Write a comment..."
              value={newCommentBody}
              onChange={e => setNewCommentBody(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <button type="submit" className="btn" style={{ width: 'auto' }}>Post</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Comments;
