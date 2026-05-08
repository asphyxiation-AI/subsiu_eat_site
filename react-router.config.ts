import type { Config } from "@react-router/dev/config";

/**
 * Глобальная конфигурация фреймворка React Router
 */
export default {
  // Настройка рендеринга:
  // ssr: true включает Server-Side Rendering (рендеринг на стороне сервера).
  // Это значительно улучшает SEO (индексацию поисковиками) и скорость первой отрисовки (LCP).
  // Для SPA-режима (Single Page Application) нужно установить в false.
  ssr: true,
} satisfies Config; // satisfies гарантирует строгое соответствие типов Config без потери контекста