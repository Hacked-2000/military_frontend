import { Link } from 'react-router-dom';

function Layout({ user, onLogout, children }) {
  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">Military Asset Management</div>
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/purchases">Purchases</Link>
          <Link to="/transfers">Transfers</Link>
          <Link to="/assignments">Assignments</Link>
        </div>
        <div className="nav-user">
          <span>{user.username} ({user.role})</span>
          <button onClick={onLogout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
