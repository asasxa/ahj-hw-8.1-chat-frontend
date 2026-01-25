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

const errorHandler = new ErrorHandler(input);

const baseUrl = 'simple-chat-2021.herokuapp.com';

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
    // регистрируем имя пользователя на сервере
    const response = await api.add({ name: ownName });

    if (response) {
      // если имя уникально

      // откроем веб-сокет соединение
      const ws = new WebSocket(`wss://${baseUrl}`);

      // добавим обработчики чата
      chatInput.addEventListener('keyup', (chatInputEvent) => {
        if (chatInputEvent.key === 'Enter') {
          const { value: msg } = chatInput;
          if (!msg || !msg.trim()) {
            chatInput.value = '';
            return;
          }

          const newMessage = JSON.stringify(
            {
              author: ownName,
              message: msg.trim(),
            },
          );

          ws.send(newMessage);

          chatInput.value = '';
        }
      });

      document.onclick = (documentEvent) => {
        if (!documentEvent.target.closest('.chat-widget')) {
          chatInput.value = '';
        }
      };

      // найдем список пользователей
      const usersContainer = document.querySelector('.users-list-container');
      const usersList = usersContainer.querySelector('.users-list');

      // обработаем входящие от сервера
      ws.addEventListener('message', (wsMsgEvent) => {
        // если сервер прислал нам сообщение
        const data = JSON.parse(wsMsgEvent.data);

        if (Array.isArray(data)) {
          // обновим список пользователей
          usersList.textContent = '';
          usersList.insertAdjacentHTML('beforeend', TemplateEngine.getUsersHTML(data, ownName));
        } else if (typeof data === 'object') {
          // или добавим сообщение в чат лист
          TemplateEngine.addMessage(messages, data, ownName, messagesContainer);
        }
      });

      // уведомим пользователя при обрыве соединения
      ws.addEventListener('close', () => {
        chatInput.disabled = true;
        chatInput.placeholder = 'Работа сервера приостановлена';
      });

      // уведомим пользователя при восстановлении соединения
      ws.addEventListener('open', () => {
        chatInput.disabled = false;
        chatInput.placeholder = 'Введите ваше сообщение';
      });

      // спрячем модальное окно
      modal.classList.remove('active');

      setInterval(() => {
        // покажем список пользователей
        usersContainer.classList.add('active');
      }, 1000);

      // покажем чат
      chat.classList.add('active');

      // очистим чат, чтобы при дублировании окна не остался старый текст
      chatInput.value = '';

      // установим курсор в поле ввода чата
      chatInput.focus();
    }
  })();
};
