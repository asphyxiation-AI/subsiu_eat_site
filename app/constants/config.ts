// Конфигурация столовой СибГИУ
// Важно: используем import.meta.env для клиента, process.env для сервера

// Время работы (Новокузнецк, UTC+7)
export const ORDER_START_TIME = import.meta.env.VITE_ORDER_START_TIME || "08:00";
export const ORDER_END_TIME = import.meta.env.VITE_ORDER_END_TIME || "16:00";

// Временной слот для интервала заказа (в минутах)
export const ORDER_SLOT_INTERVAL = 30;

// Часовой пояс Новокузнецка
export const TIMEZONE = "Asia/Novokuznetsk";

// Флаг для тестирования (пропуск проверки времени)
export const SKIP_TIME_CHECK = import.meta.env.VITE_SKIP_TIME_CHECK === "true";

// === Конфигурация внешних сервисов ===
// Keycloak - публичные параметры (безопасно для клиента)
export const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080";
export const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || "my-app";
export const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "canteen-web";

// Client Secret для Keycloak - ТОЛЬКО на сервере
// Эта функция должна вызываться только в серверном коде
export function getKeycloakClientSecret(): string {
  // Используем process.env только на сервере (проверяем через globalThis)
  const secret = typeof window === 'undefined' 
    ? (process.env.SERVER_KEYCLOAK_CLIENT_SECRET || process.env.VITE_KEYCLOAK_CLIENT_SECRET)
    : undefined;
  
  if (!secret) {
    console.error("SERVER_KEYCLOAK_CLIENT_SECRET не настроен на сервере");
    throw new Error("SERVER_KEYCLOAK_CLIENT_SECRET не настроен на сервере");
  }
  return secret;
}

// Оплата
export const PAYMENT_URL = import.meta.env.VITE_PAYMENT_URL || "https://pay.sibsiu.ru/";

// URL приложения
export const APP_URL = import.meta.env.VITE_APP_URL || "http://localhost:5173";
