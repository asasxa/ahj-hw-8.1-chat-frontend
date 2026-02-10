import ErrorHandler from './ErrorHandler';
import API from './API';
import TemplateEngine from './TemplateEngine';

// DOM-элементы
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

// Инициализация
const errorHandler = new ErrorHandler(input);
const baseUrl = 'ahj-hw-8-1-chat-backend.onrender.com';
const api = new API(`https://${baseUrl}`, modal, input, loading);

// Попытка подключения к серверу
api.connection();

// Обработка формы выбора имени
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
      // Регистрация имени
      const response = await api.add({ name: ownName });
      if (!response) return; // ошибка уже обработана в API.add()

      // Подключение по WebSocket
      const ws = new WebSocket(`wss://${baseUrl}`);

      // Обработка ошибок WebSocket
      ws.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
        chatInput.disabled = true;
        chatInput.placeholder = 'Ошибка подключения к серверу';
      });

      // Соединение закрыто
      ws.addEventListener('close', () => {
        chatInput.disabled = true;
        chatInput.placeholder = 'Работа сервера приостановлена';
      });

      // Соединение открыто
      ws.addEventListener('open', () => {
        chatInput.disabled = false;
        chatInput.placeholder = 'Введите ваше сообщение';
        usersContainer.classList.add('active'); // показываем список пользователей
      });

      // Обработка входящих сообщений и списка пользователей
      ws.addEventListener('message', (wsMsgEvent) => {
        try {
          const data = JSON.parse(wsMsgEvent.data);

          if (Array.isArray(data)) {
            // Обновление списка пользователей
            usersList.textContent = '';
            usersList.insertAdjacentHTML('beforeend', TemplateEngine.getUsersHTML(data, ownName));
          } else if (data && typeof data === 'object' && data.author && data.message) {
            // Добавление сообщения в чат
            TemplateEngine.addMessage(messages, data, ownName, messagesContainer);
          }
        } catch (e) {
          console.warn('Некорректные данные от сервера:', wsMsgEvent.data);
        }
      });

      // Отправка сообщений
      chatInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
          const msg = chatInput.value.trim();
          if (!msg) {
            chatInput.value = '';
            return;
          }

          const newMessage = JSON.stringify({
            author: ownName,
            message: msg,
          });

          if (ws.readyState === WebSocket.OPEN) {
            ws.send(newMessage);
          } else {
            console.warn('Сообщение не отправлено: WebSocket не подключён');
          }

          chatInput.value = '';
        }
      });

      // Очистка поля ввода при клике вне чата
      document.addEventListener('click', (event) => {
        if (!event.target.closest('.chat-widget')) {
          chatInput.value = '';
        }
      });

      // Скрыть модальное окно и показать чат
      modal.classList.remove('active');
      chat.classList.add('active');
      chatInput.focus();

    } catch (error) {
      console.error('Неожиданная ошибка при инициализации чата:', error);
    }
  })();
};
