import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import { getProfile, updateProfile } from '../../api/auth';

export function ProfilePage() {
  const navigate = useNavigate();
  const { token, member, logout } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const hasToken = Boolean(
      token || (typeof window !== 'undefined' && window.localStorage.getItem('authToken'))
    );

    if (!hasToken) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await getProfile();
        const data = response.data;
        setUsername(data.username || '');
      } catch (err) {
        if (err.response && err.response.status === 401) {
          navigate('/login');
          return;
        }

        let message = 'Не удалось загрузить профиль.';

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
        setIsLoading(false);
      }
    };

    const hasToken = Boolean(
      token || (typeof window !== 'undefined' && window.localStorage.getItem('authToken'))
    );

    if (hasToken) {
      fetchProfile();
    }
  }, [token, navigate]);

  const handleSave = async (event) => {
    event.preventDefault();

    if (!username) {
      setError('Имя пользователя не может быть пустым.');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await updateProfile({ username });
      const data = response.data;

      setUsername(data.username || '');
      setSuccess('Профиль успешно сохранён.');
    } catch (err) {
      let message = 'Не удалось сохранить профиль.';

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
      setIsSaving(false);
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    navigate('/login');
  };

  const resolvedUsername = username || (member && member.username ? member.username : '');

  return (
    <div
      data-easytag="id1-react/src/components/Profile/index.jsx"
      className="page page-profile"
    >
      <div className="form-page-container">
        <div className="profile-header-row">
          <h1 className="form-title">Профиль</h1>
          <button
            type="button"
            className="profile-logout-button"
            onClick={handleLogoutClick}
          >
            Выйти
          </button>
        </div>

        {isLoading ? (
          <p>Загрузка профиля...</p>
        ) : (
          <form className="form" onSubmit={handleSave}>
            <div className="form-field">
              <label className="form-label" htmlFor="profile-username">
                Имя пользователя
              </label>
              <input
                id="profile-username"
                type="text"
                className="form-input"
                value={resolvedUsername}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Имя пользователя"
              />
            </div>

            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}

            <button
              type="submit"
              className="form-submit-button"
              disabled={isSaving}
            >
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
