// Загружаем dotenv только если файл .env существует (для локальной разработки)
// В production (Railway) переменные окружения передаются напрямую
try {
  await import("dotenv/config");
} catch {
  // .env файл не найден, используем переменные окружения из системы
}
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

const prismaClientSingleton = () => {
  // Используем DATABASE_URL из переменных окружения
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  // Создаём пул подключений
  pool = new Pool({
    connectionString: databaseUrl,
    // Настройки пула для production
    ...(process.env.NODE_ENV === "production" && {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }),
  });
  
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export { prisma };

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

// === Graceful shutdown - закрытие соединений с БД ===
async function shutdown() {
  console.log("Закрытие соединений с базой данных...");
  
  try {
    await prisma.$disconnect();
    
    if (pool) {
      await pool.end();
      console.log("Соединения с БД закрыты");
    }
  } catch (error) {
    console.error("Ошибка при закрытии соединений:", error);
  }
  
  process.exit(0);
}

// Регистрируем обработчики сигналов для корректного завершения
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("beforeExit", shutdown);
