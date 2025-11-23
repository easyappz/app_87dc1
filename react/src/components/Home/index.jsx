import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import { fetchMessages, sendMessage } from '../../api/chat';

function formatTimestamp(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HomeChatPage() {
  const navigate = useNavigate();
  const { token, member } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [sendError, setSendError] = useState('');
  const [text, setText] = useState('');

  const hasToken = Boolean(
    token || (typeof window !== 'undefined' && window.localStorage.getItem('authToken'))
  );

  useEffect(() => {
    if (!hasToken) {
      navigate('/login');
    }
  }, [hasToken, navigate]);

  useEffect(() => {
    if (!hasToken) {
      return;
    }

    let isActive = true;

    const loadMessages = async (silent) => {
      if (!silent) {
        setIsInitialLoading(true);
      }

      setLoadError('');

      try {
        const response = await fetchMessages();

        if (!isActive) {
          return;
        }

        const data = response.data;

        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]);
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          navigate('/login');
          return;
        }

        let message = 'Не удалось загрузить сообщения.';

        if (err.response && err.response.data) {
          const data = err.response.data;

          if (typeof data === 'string') {
            message = data;
          } else if (typeof data === 'object') {
            const messagesList = [];

            Object.keys(data).forEach((key) => {
              const value = data[key];

              if (Array.isArray(value)) {
                value.forEach((item) => {
                  messagesList.push(String(item));
                });
              } else if (value) {
                messagesList.push(String(value));
              }
            });

            if (messagesList.length > 0) {
              message = messagesList.join(' ');
            }
          }
        }

        setLoadError(message);
      } finally {
        if (!silent) {
          setIsInitialLoading(false);
        }
      }
    };

    loadMessages(false);

    const intervalId = window.setInterval(() => {
      loadMessages(true);
    }, 4000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [hasToken, navigate]);

  const handleSend = async (event) => {
    event.preventDefault();

    const trimmed = text.trim();

    if (!trimmed) {
      return;
    }

    setIsSending(true);
    setSendError('');

    try {
      const response = await sendMessage({ text: trimmed });
      const newMessage = response.data;

      if (newMessage) {
        setMessages((prev) => [...prev, newMessage]);
      }

      setText('');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
        return;
      }

      let message = 'Не удалось отправить сообщение.';

      if (err.response && err.response.data) {
        const data = err.response.data;

        if (typeof data === 'string') {
          message = data;
        } else if (typeof data === 'object') {
          const messagesList = [];

          Object.keys(data).forEach((key) => {
            const value = data[key];

            if (Array.isArray(value)) {
              value.forEach((item) => {
                messagesList.push(String(item));
              });
            } else if (value) {
              messagesList.push(String(value));
            }
          });

          if (messagesList.length > 0) {
            message = messagesList.join(' ');
          }
        }
      }

      setSendError(message);
    } finally {
      setIsSending(false);
    }
  };

  const currentUsername = member && member.username ? member.username : null;

  return (
    <div
      data-easytag="id1-react/src/components/Home/index.jsx"
      className="page page-home"
    >
      <div className="chat-page-container">
        <div className="chat-page-header">
          <h1 className="chat-title">Групповой чат</h1>
          <p className="chat-subtitle">Общайтесь с другими пользователями в реальном времени.</p>
        </div>

        <div className="chat-main">
          <div className="chat-messages" id="chat-messages">
            {isInitialLoading ? (
              <div className="chat-status">Загрузка сообщений...</div>
            ) : messages.length === 0 ? (
              <div className="chat-status">Сообщений пока нет. Напишите первое сообщение.</div>
            ) : (
              messages.map((message) => {
                const isOwn =
                  currentUsername && message.member_username === currentUsername;

                return (
                  <div
                    key={message.id}
                    className={
                      isOwn
                        ? 'chat-message chat-message--own'
                        : 'chat-message'
                    }
                  >
                    <div className="chat-message__meta">
                      <span className="chat-message__user">
                        {message.member_username || 'Неизвестный пользователь'}
                      </span>
                      <span className="chat-message__time">
                        {formatTimestamp(message.created_at)}
                      </span>
                    </div>
                    <div className="chat-message__text">{message.text}</div>
                  </div>
                );
              })
            )}

            {loadError && <div className="chat-error">{loadError}</div>}
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              type="text"
              className="chat-input"
              placeholder="Введите сообщение"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <button
              type="submit"
              className="chat-send-button"
              disabled={isSending || !text.trim()}
            >
              {isSending ? 'Отправка...' : 'Отправить'}
            </button>
          </form>

          {sendError && <div className="chat-error chat-error--footer">{sendError}</div>}
        </div>
      </div>
    </div>
  );
}

export const Home = HomeChatPage;
