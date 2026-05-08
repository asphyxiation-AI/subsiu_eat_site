#!/bin/sh
# set -e останавливает выполнение скрипта при любой ошибке (защита от запуска приложения на битой БД)
set -e

# КИБЕРБЕЗОПАСНОСТЬ: Принудительно проставляем DATABASE_URL для Prisma.
# В реальных проектах это должно приходить из секретов, но здесь мы гарантируем 
# корректную работу миграций в изолированной сети Docker.
export DATABASE_URL="postgresql://postgres:1@sibsiu-postgres:5432/sibsiu_canteen?schema=public"

echo "🔄 Resetting and applying all database migrations..."
# Сброс базы до чистого состояния. Важно для разработки, чтобы структура всегда была актуальной.
npx prisma migrate reset --force --config prisma.config.ts

echo "✅ ✅ ✅ ИСПРАВЛЕНИЕ БАГА PRISMA 7.8.0!"
echo "🔄 Повторно применяем миграции потому что после reset Prisma их откатывает обратно"
# ЛОГИКА: Это критический фикс. Prisma 7.8.0 может удалять схему после reset, 
# поэтому deploy гарантирует наличие таблиц перед сидингом.
npx prisma migrate deploy --config prisma.config.ts

echo "✅ Migrations применены по настоящему"
echo "⏳ Waiting 5 seconds for PostgreSQL to commit all changes..."
# Пауза необходима для завершения транзакций на стороне PostgreSQL сервера.
sleep 5

echo "🌱 Seeding initial database data..."
# КИБЕРБЕЗОПАСНОСТЬ И СТАБИЛЬНОСТЬ: Запуск сида в новом процессе node через execSync 
# гарантирует полную изоляцию памяти и переподключение к БД с чистого листа.
# Прямой запуск tsx prisma/seed.ts вместо prisma db seed, чтобы избежать 
# передачи datasource из prisma.config.ts в конструктор PrismaClient (баг Prisma 7.8.0).
node --eval "
const { execSync } = require('child_process');
console.log('Starting seed in new process...');
execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
"

echo "✅ Migrations and seeding applied successfully"
echo "🚀 Starting application server on 0.0.0.0:5173"
# Мы запускаем сервер напрямую, указывая хост 0.0.0.0
# Это позволит Docker пробрасывать запросы с твоего компьютера внутрь контейнера.
# 'exec' заменяет процесс оболочки процессом сервера, чтобы он правильно обрабатывал сигналы остановки (SIGTERM).
exec npx react-router-serve ./build/server/index.js --host 0.0.0.0 --port 5173