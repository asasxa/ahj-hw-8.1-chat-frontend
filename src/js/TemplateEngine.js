export default class TemplateEngine {
  static getUsersHTML(data, ownName) {
    const fragment = document.createDocumentFragment();

    data.forEach((userName) => {
      const li = document.createElement('li');
      li.className = `users-list__user ${userName === ownName ? 'self' : ''}`;
      li.textContent = userName === ownName ? 'You' : userName;
      fragment.appendChild(li);
    });

    return fragment;
  }

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

  static addMessage(messages, data, ownName, messagesContainer) {
    const time = this.getTime();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.author === ownName ? 'self' : ''}`;

    const headerDiv = document.createElement('div');
    headerDiv.className = 'message__header';
    headerDiv.textContent = `${data.author === ownName ? 'You' : data.author}, ${time}`;

    const textDiv = document.createElement('div');
    textDiv.className = 'message__text';
    textDiv.textContent = data.message;

    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(textDiv);
    messages.appendChild(messageDiv);

    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}
