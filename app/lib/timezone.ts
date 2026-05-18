// Утилиты для работы с часовым поясом UTC+7 (Новокузнецк/Новосибирск)

// Часовой пояс Новокузнецка (UTC+7) - смещение в миллисекундах
const NOVOKUZNETSK_OFFSET_MS = 7 * 60 * 60 * 1000; // 7 часов в миллисекундах

/**
 * Получить текущую дату и время в часовом поясе UTC+7 (Новокузнецк)
 * Работает и на сервере (если сервер в UTC), и на клиенте (любой часовой пояс пользователя)
 */
export function getLocalDate(): Date {
  const now = new Date();
  // Разница между локальным временем пользователя/сервера и UTC+7
  const localOffsetMs = now.getTimezoneOffset() * 60 * 1000; // getTimezoneOffset возвращает минуты, обратные UTC
  const utcMs = now.getTime() + localOffsetMs; // переводим локальное время в UTC
  const novosibirskMs = utcMs + NOVOKUZNETSK_OFFSET_MS; // добавляем смещение GMT+7
  return new Date(novosibirskMs);
}

/**
 * Получить день недели (0-6, где 0 = воскресенье) в часовом поясе UTC+7
 */
export function getLocalDayOfWeek(): number {
  const localDate = getLocalDate();
  return localDate.getDay();
}

/**
 * Получить текущий цикл работы столовой (день недели и тип недели)
 * Столовая работает с понедельника по пятницу
 * В выходные показываем последний рабочий день (пятницу)
 * Возвращает: dayOfWeek (1-7, где 1=понедельник), weekType (1 или 2)
 */
export function getCurrentCycleDay(): { dayOfWeek: number; weekType: number } {
  // Получаем дату в UTC+7
  const localDate = getLocalDate();
  let dayOfWeek = localDate.getDay(); // 0 = воскресенье, 1 = понедельник, ..., 6 = суббота
  
  // Воскресенье (0) и суббота (6) - выходные дни, показываем пятницу
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    dayOfWeek = 5; // Пятница
  }
  
  // Вычисляем номер недели в году на основе UTC+7 даты
  const year = localDate.getFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const pastDays = (localDate.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
  
  // Чётная неделя = Неделя 2, нечётная = Неделя 1
  const weekType = weekNumber % 2 === 0 ? 2 : 1;
  
  return { dayOfWeek, weekType };
}

/**
 * Форматтер даты для отображения в UTC+7
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Форматтер времени для отображения в UTC+7
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Форматтер даты и времени для отображения в UTC+7
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} в ${formatTime(date)}`;
}

/**
 * Получить текущую дату в UTC+7 с временем 00:00:00 (начало дня)
 * Используется для серверной фильтрации записей по дате
 */
export function getLocalStartOfDay(): Date {
  const localDate = getLocalDate();
  localDate.setHours(0, 0, 0, 0);
  return localDate;
}

/**
 * Проверить, является ли текущий день в UTC+7 выходным
 */
export function isWeekend(): boolean {
  const day = getLocalDayOfWeek();
  return day === 0 || day === 6;
}

/**
 * Получить текущее время в минутах от полуночи в часовом поясе UTC+7
 */
export function getLocalMinutesSinceMidnight(): number {
  const localDate = getLocalDate();
  return localDate.getHours() * 60 + localDate.getMinutes();
}

/**
 * Проверить, прошло ли указанное время слота (startTime) относительно текущего UTC+7 времени
 * Возвращает true, если до начала слота осталось меньше 15 минут
 */
export function isSlotClosed(startTime: string): boolean {
  const [hours, minutes] = startTime.split(':').map(Number);
  const slotTotalMinutes = hours * 60 + minutes;
  const nowMinutes = getLocalMinutesSinceMidnight();
  // Слот закрыт, если до него меньше 15 минут
  return (slotTotalMinutes - nowMinutes) < 15;
}