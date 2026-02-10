export default class ErrorHandler {
  constructor(input) {
    this.input = input;
  }

  outputError(message) {
    // Удалим предыдущую ошибку, если есть
    const existingError = this.input.nextElementSibling;
    if (existingError && existingError.classList.contains('error')) {
      existingError.remove();
    }

    // Создаём элемент безопасно
    const errorEl = document.createElement('p');
    errorEl.className = 'error';
    errorEl.textContent = message; // ← только текст!

    // Вставляем после поля ввода
    this.input.parentNode.insertBefore(errorEl, this.input.nextSibling);

    // Блокируем поле
    this.input.disabled = true;

    // Автоудаление через 2 секунды
    setTimeout(() => {
      if (errorEl.parentNode) {
        errorEl.remove();
      }
      this.input.disabled = false;
    }, 2000);
  }
}
