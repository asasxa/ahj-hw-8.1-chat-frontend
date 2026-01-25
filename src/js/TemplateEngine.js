export default class TemplateEngine {
  // создадим метод для заполнения списка пользователей
  static getUsersHTML(data, ownName) {
    let html = '';

    data.forEach((userName) => {
      html += `
        <li class="users-list__user ${userName === ownName ? 'self' : ''}">${userName === ownName ? 'You' : userName}</li>
      `;
    });

    return html;
  }

  // создадим метод для получения текущего времени в формате "мм:чч дд.мм.гггг"
  static getTime() {
    const date = new Date();

    const options = { dateStyle: 'short', timeStyle: 'short' };

    const formattedDate = new Intl.DateTimeFormat('ru-RU', options)
      .format(date)
      .split(',')
      .reverse()
      .join(' ');

    return formattedDate;
  }

  // создадим метод для добавления чужих сообщений в чат
  static addMessage(messages, data, ownName, messagesContainer) {
    const time = this.getTime();

    messages.insertAdjacentHTML('beforeend', `
      <div class="message ${data.author === ownName ? 'self' : ''}">
        <div class="message__header">${data.author === ownName ? 'You' : data.author}, ${time}</div>
        <div class="message__text">${data.message}</div>
      </div>
    `);

    messagesContainer.scrollTo(0, messagesContainer.scrollHeight);
  }
}
