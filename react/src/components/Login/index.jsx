import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username || !password) {
      setError('Введите имя пользователя и пароль.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await login({ username, password });
      navigate('/');
    } catch (err) {
      let message = 'Неправильное имя пользователя или пароль.';

      if (err.response && err.response.data) {
        const data = err.response.data;

        if (typeof data === 'string') {
          message = data;
        } else if (typeof data === 'object') {
          const messages = [];

          Object.keys(data).forEach((key) => {
            const value = data[key];

            if (Array.isArray(value)) {
              value.forEach((item) => {
                messages.push(String(item));
              });
            } else if (value) {
              messages.push(String(value));
            }
          });

          if (messages.length > 0) {
            message = messages.join(' ');
          }
        }
      }

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-easytag="id1-react/src/components/Login/index.jsx"
      className="page page-login"
    >
      <div className="form-page-container">
        <h1 className="form-title">Авторизация</h1>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="login-username">
              Имя пользователя
            </label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Введите имя пользователя"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="login-password">
              Пароль
            </label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите пароль"
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            type="submit"
            className="form-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="form-footer-text">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
}
