import instance from './axios';

export function fetchMessages(params) {
  if (params) {
    return instance.get('/api/chat/messages/', { params });
  }

  return instance.get('/api/chat/messages/');
}

export function sendMessage({ text }) {
  return instance.post('/api/chat/messages/', { text });
}
