import ErrorHandler from './ErrorHandler';

export default class API extends ErrorHandler {
  constructor(baseUrl, modal, input, loading) {
    super(input);
    this.modal = modal;
    this.loading = loading;
    this.baseUrl = baseUrl;
    this.contentTypeHeader = { 'Content-Type': 'application/json' };
  }

  connection() {
    fetch(`${this.baseUrl}/check`).then(
      () => {
        this.loading.classList.remove('active');
        this.modal.classList.add('active');
      },
      () => {
        this.connection();
      },
    );
  }

  add(contact) {
    this.input.disabled = true;
    this.input.placeholder = 'Подождите, ваш запрос обрабатывается...';
    return fetch(`${this.baseUrl}/users`, {
      body: JSON.stringify(contact),
      method: 'POST',
      headers: this.contentTypeHeader,
    }).then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response;
    }).catch((response) => {
      this.input.placeholder = '';
      if (response.message === 'Failed to fetch') {
        this.outputError('Ошибка! Сервер недоступен.');
      } else if (response.message === 'Bad Request') {
        this.outputError('Ошибка! Имя уже существует.');
      } else {
        this.outputError(`Неизвестная ошибка: ${response.message}.`);
      }
    });
  }
}
