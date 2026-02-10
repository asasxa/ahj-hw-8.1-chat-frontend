import ErrorHandler from './ErrorHandler';
import API from './API';
import TemplateEngine from './TemplateEngine';

const modal = document.querySelector('.modal');
const form = modal.querySelector('.modal__form');
const input = form.querySelector('.modal-form__input');
const chat = document.querySelector('.chat-widget');
const messagesContainer = chat.querySelector('.chat-widget__messages-container');
const messages = chat.querySelector('.chat-widget__messages');
const chatInput = chat.querySelector('.chat-widget__input');
const loading = document.querySelector('.status-loading');
const usersContainer = document.querySelector('.users-list-container');
const usersList = usersContainer.querySelector('.users-list');

const errorHandler = new ErrorHandler(input);
const baseUrl = 'ahj-hw-8-1-chat-backend.onrender.com';
const api = new API(`https://${baseUrl}`, modal, input, loading);

api.connection();

form.onsubmit = (event) => {
  event.preventDefault();

  const { value } = input;
  if (!value || !value.trim()) {
    input.value = '';
    errorHandler.outputError('Ошибка! Введено пустое значение.');
    return;
  }

  const ownName = value.trim();
  input.value = '';

  (async () => {
    try {
      const response = await api.add({ name: ownName });
      if (!response) return;

      loading.textContent = 'Подключение к чату...';
      loading.classList.add('active');

      const ws = new WebSocket(`wss://${baseUrl}`);

      ws.addEventListener('error', () => {
        loading.classList.remove('active');
        errorHandler.outputError('Не удалось подключиться к чату. Попробуйте позже.');
      });

      ws.addEventListener('close', () => {
        chatInput.disabled = true;
        chatInput.placeholder = 'Соединение с сервером потеряно';
      });

      ws.addEventListener('open', () => {
        loading.classList.remove('active');
        modal.classList.remove('active');
        chat.classList.add('active');
        chatInput.disabled = false;
        chatInput.placeholder = 'Введите ваше сообщение';
        chatInput.focus();
        usersContainer.classList.add('active');
      });

      ws.addEventListener('message', (wsMsgEvent) => {
        try {
          const data = JSON.parse(wsMsgEvent.data);
          if (Array.isArray(data)) {
            usersList.textContent = '';
            usersList.appendChild(TemplateEngine.getUsersHTML(data, ownName));
          } else if (data && typeof data === 'object' && data.author && data.message) {
            TemplateEngine.addMessage(messages, data, ownName, messagesContainer);
          }
        } catch (e) {
          console.warn('Некорректные данные от сервера:', wsMsgEvent.data);
        }
      });

      chatInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
          const msg = chatInput.value.trim();
          if (!msg) {
            chatInput.value = '';
            return;
          }

          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ author: ownName, message: msg }));
          }
          chatInput.value = '';
        }
      });

      document.addEventListener('click', (event) => {
        if (!event.target.closest('.chat-widget')) {
          chatInput.value = '';
        }
      });

    } catch (error) {
      console.error('Неожиданная ошибка при инициализации чата:', error);
      loading.classList.remove('active');
    }
  })();
};
