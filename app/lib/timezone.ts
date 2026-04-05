// Утилиты для работы с часовым поясом UTC+7 (Новосибирск)

// Часовой пояс Новосибирска (UTC+7) - смещение в миллисекундах
const TIMEZONE_OFFSET_MS = 7 * 60 * 60 * 1000; // 7 часов в миллисекундах

/**
 * Получить текущую дату и время в часовом поясе UTC+7
 * Предполагаем, что сервер работает в UTC+7 (Новосибирск)
 */
export function getLocalDate(): Date {
  // Сервер работает в UTC+7 ( Novosibirsk), поэтому просто используем текущее время
  return new Date();
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
  
  // Вычисляем номер недели в году
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
 * Сервер работает в UTC+7, поэтому не нужно добавлять смещение
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Сервер в UTC+7 - просто форматируем как есть
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Форматтер времени для отображения в UTC+7
 * Сервер работает в UTC+7, поэтому не нужно добавлять смещение
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Сервер в UTC+7 - просто форматируем как есть
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
