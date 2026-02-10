import ErrorHandler from './ErrorHandler';

export default class API extends ErrorHandler {
  constructor(baseUrl, modal, input, loading) {
    super(input);
    this.modal = modal;
    this.loading = loading;
    this.baseUrl = baseUrl;
    this.contentTypeHeader = { 'Content-Type': 'application/json' };
  }

  async connection(maxRetries = 10, delayMs = 2000) {
    let attempt = 0;

    const tryConnect = async () => {
      try {
        const response = await fetch(`${this.baseUrl}/check`);
        if (response.ok) {
          this.loading.classList.remove('active');
          this.modal.classList.add('active');
          return true;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        attempt++;
        console.warn(`Попытка ${attempt} не удалась:`, error.message);

        if (attempt >= maxRetries) {
          this.outputError('Не удалось подключиться к серверу. Проверьте соединение и обновите страницу.');
          this.loading.classList.remove('active');
          return false;
        }

        await new Promise(resolve => setTimeout(resolve, delayMs));
        return tryConnect();
      }
    };

    return tryConnect();
  }

  async add(contact) {
    this.input.disabled = true;
    this.input.placeholder = 'Подождите, ваш запрос обрабатывается...';

    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: this.contentTypeHeader,
        body: JSON.stringify(contact),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(response.status === 400 ? 'Bad Request' : response.statusText);
      }

      return response;
    } catch (error) {
      this.input.placeholder = '';
      this.input.disabled = false;

      if (error.message === 'Failed to fetch') {
        this.outputError('Ошибка! Сервер недоступен.');
      } else if (error.message === 'Bad Request') {
        this.outputError('Ошибка! Имя уже существует.');
      } else {
        this.outputError(`Неизвестная ошибка: ${error.message}.`);
      }
    }
  }
}
