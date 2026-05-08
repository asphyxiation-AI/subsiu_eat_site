// Подгружаем переменные окружения из .env. 
// В Docker-окружении переменные прокидываются из docker-compose.yml автоматически.
import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Централизованная конфигурация Prisma ORM.
 * Используется CLI-инструментами для выполнения миграций и сидинга.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Команда для наполнения БД. tsx позволяет запускать TypeScript-скрипты напрямую без компиляции.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // БЕЗОПАСНОСТЬ: URL базы данных никогда не пишется строкой, 
    // только берется из переменной окружения DATABASE_URL.
    url: process.env["DATABASE_URL"],
  },
});
