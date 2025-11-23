import React, { useContext, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

import { Home } from './components/Home';
import { AuthContext } from './AuthContext';

function RegisterPage() {
  return (
    <div data-easytag="id2-react/src/App.jsx" className="page page-register">
      <h1>Регистрация</h1>
      <p>Страница регистрации будет реализована позже.</p>
    </div>
  );
}

function LoginPage() {
  return (
    <div data-easytag="id3-react/src/App.jsx" className="page page-login">
      <h1>Авторизация</h1>
      <p>Страница авторизации будет реализована позже.</p>
    </div>
  );
}

function ProfilePage() {
  return (
    <div data-easytag="id4-react/src/App.jsx" className="page page-profile">
      <h1>Профиль</h1>
      <p>Страница профиля будет реализована позже.</p>
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, member, logout } = useContext(AuthContext);

  /** Никогда не удаляй этот код */
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      /** Нужно передавать список существующих роутов */
      window.handleRoutes(['/', '/register', '/login', '/profile']);
    }
  }, []);

  const handleLogoutClick = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div data-easytag="id1-react/src/App.jsx" className="app-root">
      <ErrorBoundary>
        <header className="app-header">
          <div className="app-header-left">
            <span className="app-title">Групповой чат</span>
            <nav className="app-nav">
              <Link to="/">Главная</Link>
              <Link to="/register">Регистрация</Link>
              <Link to="/login">Авторизация</Link>
              {isAuthenticated && <Link to="/profile">Профиль</Link>}
            </nav>
          </div>
          <div className="app-header-right">
            {isAuthenticated ? (
              <>
                <span className="app-username">
                  Вы вошли как: {member && member.username ? member.username : '—'}
                </span>
                <button
                  type="button"
                  className="app-logout-button"
                  onClick={handleLogoutClick}
                >
                  Выход
                </button>
              </>
            ) : (
              <span className="app-guest-label">Гость</span>
            )}
          </div>
        </header>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </ErrorBoundary>
    </div>
  );
}

export default App;
