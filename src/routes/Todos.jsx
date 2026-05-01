import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const Todos = () => {
  const [todos, setTodos] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search & Sort states
  const [searchId, setSearchId] = useState(sessionStorage.getItem('todos_searchId') || '');
  const [searchTitle, setSearchTitle] = useState(sessionStorage.getItem('todos_searchTitle') || '');
  const [searchCompleted, setSearchCompleted] = useState(sessionStorage.getItem('todos_searchCompleted') || 'all');
  const [sortBy, setSortBy] = useState(sessionStorage.getItem('todos_sortBy') || 'id');

  useEffect(() => {
    sessionStorage.setItem('todos_searchId', searchId);
    sessionStorage.setItem('todos_searchTitle', searchTitle);
    sessionStorage.setItem('todos_searchCompleted', searchCompleted);
    sessionStorage.setItem('todos_sortBy', sortBy);
  }, [searchId, searchTitle, searchCompleted, sortBy]);

  const [newTodoTitle, setNewTodoTitle] = useState('');

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

    // Check if the route parameter matches the logged-in user
    if (parsedUser.id.toString() !== userId) {
      navigate(`/users/${parsedUser.id}/todos`);
      return;
    }

    fetchTodos(parsedUser.id);
  }, [navigate, userId]);

  const fetchTodos = async (uid) => {
    try {
      const cached = sessionStorage.getItem(`todos_data_${uid}`);
      if (cached) {
        setTodos(JSON.parse(cached));
        setLoading(false);
        return;
      }
      const response = await fetch(`http://localhost:3000/todos?userId=${uid}`);
      const data = await response.json();
      setTodos(data);
      sessionStorage.setItem(`todos_data_${uid}`, JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      sessionStorage.setItem(`todos_data_${user.id}`, JSON.stringify(todos));
    }
  }, [todos, user, loading]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    const newTodo = {
      userId: isNaN(Number(user.id)) ? user.id : Number(user.id),
      title: newTodoTitle,
      completed: false
    };

    try {
      const response = await fetch('http://localhost:3000/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      });
      const data = await response.json();
      setTodos([...todos, data]);
      setNewTodoTitle('');
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const handleUpdateTodo = async (todo, updates) => {
    try {
      const response = await fetch(`http://localhost:3000/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        setTodos(todos.map(t => t.id === todo.id ? { ...t, ...updates } : t));
      }
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/todos/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setTodos(todos.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Filter and Sort logic
  const filteredTodos = todos.filter(t => {
    const matchId = searchId === '' || t.id.toString().includes(searchId);
    const matchTitle = searchTitle === '' || t.title.toLowerCase().includes(searchTitle.toLowerCase());
    const matchCompleted = searchCompleted === 'all'
      ? true
      : (searchCompleted === 'true' ? t.completed : !t.completed);

    return matchId && matchTitle && matchCompleted;
  }).sort((a, b) => {
    if (sortBy === 'id') return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'completed') return (a.completed === b.completed) ? 0 : a.completed ? -1 : 1;
    return 0;
  });

  if (loading) return <div className="text-center mt-4">Loading...</div>;

  return (
    <div className="container min-h-screen">
      <nav className="nav justify-between">
        <div className="flex gap-2 items-center">
          <Link to="/home" style={{ fontWeight: 600, fontSize: '1.25rem', color: 'var(--primary)' }}>
            MyApp
          </Link>
          <span>/ Todos</span>
        </div>
        <div className="flex gap-2">
          <Link to="/home" className="btn-secondary">Back to Home</Link>
        </div>
      </nav>

      <div className="card">
        <h1 className="title mb-6">My Todos</h1>

        {/* Add Todo */}
        <form onSubmit={handleAddTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            className="input"
            style={{ marginBottom: 0 }}
            placeholder="Add new todo..."
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
          />
          <button type="submit" className="btn" style={{ width: 'auto' }}>Add</button>
        </form>

        {/* Filters & Sorting */}
        <div className="filters-box">
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Search ID</label>
            <input type="text" className="input" style={{ padding: '0.5rem', marginBottom: 0 }} value={searchId} onChange={e => setSearchId(e.target.value)} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Search Title</label>
            <input type="text" className="input" style={{ padding: '0.5rem', marginBottom: 0 }} value={searchTitle} onChange={e => setSearchTitle(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Status</label>
            <select className="input" style={{ padding: '0.5rem', marginBottom: 0 }} value={searchCompleted} onChange={e => setSearchCompleted(e.target.value)}>
              <option value="all">All</option>
              <option value="true">Completed</option>
              <option value="false">Pending</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Sort By</label>
            <select className="input" style={{ padding: '0.5rem', marginBottom: 0 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="id">ID</option>
              <option value="title">Title</option>
              <option value="completed">Completed Status</option>
            </select>
          </div>
        </div>

        {/* Todo List */}
        <div className="flex-col gap-2">
          {filteredTodos.length === 0 ? (
            <p className="text-center">No todos found.</p>
          ) : (
            filteredTodos.map(todo => (
              <div key={todo.id} className="list-item">
                <div className="list-item-row">
                  <div className="flex items-center gap-4" style={{ flexGrow: 1, width: '100%' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', minWidth: '30px' }}>#{todo.id}</span>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={(e) => handleUpdateTodo(todo, { completed: e.target.checked })}
                      style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={todo.title}
                      onChange={(e) => handleUpdateTodo(todo, { title: e.target.value })}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        color: todo.completed ? 'var(--text-muted)' : 'var(--text)',
                        fontSize: '1rem',
                        width: '100%',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <button onClick={() => handleDeleteTodo(todo.id)} className="btn-danger" style={{ padding: '0.5rem 1.5rem', width: 'auto' }}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Todos;
