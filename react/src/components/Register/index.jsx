import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';

export function RegistrationPage() {
  const navigate = useNavigate();

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
      await register({ username, password });
      navigate('/login');
    } catch (err) {
      let message = 'Не удалось выполнить регистрацию. Попробуйте ещё раз.';

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
      data-easytag="id1-react/src/components/Register/index.jsx"
      className="page page-register"
    >
      <div className="form-page-container">
        <h1 className="form-title">Регистрация</h1>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="register-username">
              Имя пользователя
            </label>
            <input
              id="register-username"
              type="text"
              className="form-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Введите имя пользователя"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="register-password">
              Пароль
            </label>
            <input
              id="register-password"
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
            {isSubmitting ? 'Отправка...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="form-footer-text">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </div>
    </div>
  );
}
