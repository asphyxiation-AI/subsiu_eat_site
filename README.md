# 🍽️ СибГИУ Столовая - Система заказов

Веб-приложение для онлайн-заказа еды в столовой СибГИУ с SSO авторизацией через Keycloak.

---

## 📋 Содержание

- [Описание](#-описание)
- [Технологии](#-технологии)
- [Требования](#-требования)
- [Установка и запуск](#-установка-и-запуск)
- [Docker](#docker)
- [Тестирование](#-тестирование)
- [Мониторинг](#-мониторинг)
- [Настройка Keycloak](#-настройка-keycloak)
- [Структура проекта](#-структура-проекта)
- [API Endpoints](#-api-endpoints)
- [Роли пользователей](#-роли-пользователей)

---

## 📖 Описание

Система онлайн-заказов для столовой СибГИУ позволяет студентам и сотрудникам:
- Просматривать меню с фильтрацией по категориям
- Добавлять блюда в корзину
- Оформлять заказы на конкретное время
- Оплачивать через платежный шлюз университета

Администраторы могут:
- Управлять меню (добавлять/скрывать блюда)
- Отслеживать и обновлять статусы заказов
- Публиковать меню на определенную неделю

---

## 💻 Технологии

### Основной стек

| Технология | Назначение |
|------------|------------|
| React Router v7 | Основной фреймворк (Framework Mode) |
| React 19 | UI библиотека |
| PostgreSQL 17 | Реляционная база данных |
| Prisma 7 | ORM для работы с БД |
| Keycloak 26 | SSO Авторизация и безопасность |
| Tailwind CSS 4 | Стилизация |
| TypeScript 5 | Строгая типизация |
| Vite 7 | Сборщик проекта |

### Инфраструктура и инструменты

| Технология | Назначение |
|------------|------------|
| Docker | Контейнеризация |
| Prometheus | Метрики и мониторинг |
| Grafana | Визуализация метрик |
| Loki | Логирование |
| Jest | Тестирование |
| Zod | Валидация данных |

---

## ✅ Требования

- **Node.js** 18+ (LTS)
- **PostgreSQL** 15+
- **Docker** и **Docker Compose**
- **npm** 9+

---

## 🚀 Установка и запуск

### 1. Клонирование репозитория

```bash
git clone https://github.com/asphyxiation-AI/subsiu_eat_site.git
cd subsiu_eat_site
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Создайте файл `.env`:

```env
# Database connection
DATABASE_URL="postgresql://postgres:1@localhost:5432/sibsiu_canteen?schema=public"

# === Keycloak ===
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=canteen
VITE_KEYCLOAK_CLIENT_ID=canteen-web
KEYCLOAK_CLIENT_SECRET=VCHfWLinO4Vx8hM2e4a8fVpflPuSButf

# === Payment ===
VITE_PAYMENT_URL=https://pay.sibsiu.ru/

# === App URL ===
VITE_APP_URL=http://localhost:5173

# === Server ===
NODE_ENV=development
```

### 4. Настройка базы данных

```bash
# Генерация Prisma Client
npx prisma generate

# Применение миграций
npx prisma db push
```

### 5. Запуск приложения

#### Режим разработки:
```bash
npm run dev
```

#### Продакшн режим:
```bash
npm run build
npm run start
```

---

## 🐳 Docker

Полная инфраструктура с мониторингом запускается одной командой:

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка
docker-compose down
```

### Доступные сервисы

| Сервис | URL | Описание |
|--------|-----|----------|
| Приложение | http://localhost:5173 | Основное веб-приложение |
| Keycloak | http://localhost:8080 | SSO авторизация |
| PostgreSQL | localhost:5432 | База данных |
| Prometheus | http://localhost:9090 | Метрики |
| Grafana | http://localhost:3000 | Дашборды (admin/admin) |
| Loki | http://localhost:3100 | Логи |

---

## 🧪 Тестирование

### Запуск тестов

```bash
# Все тесты
npm test

# В режиме watch
npm run test:watch

# С покрытием
npm run test:coverage
```

### Структура тестов

```
tests/
├── setup.ts                 # Моки и настройки
└── api.create-order.test.ts # Тесты валидации
```

---

## 📊 Мониторинг

### Grafana Dashboard

После запуска Docker доступен дашборд "SibSIU Canteen Overview" с панелями:
- HTTP Requests Rate
- Response Time (p95)
- Success Rate
- Recent Errors (логи)

### Метрики Prometheus

Мониторинг включает:
- Метрики Keycloak
- Метрики приложения
- Системные метрики (при наличии node-exporter)

### Логирование

Loki собирает логи из:
- Docker контейнеров
- Приложения
- Системы

---

## 🔐 Настройка Keycloak

### Быстрая настройка (обязательно!)

1. **Откройте Keycloak Admin Console**
   - Адрес: `http://localhost:8080`
   - Логин: `admin` / Пароль: `admin`

2. **Создайте или выберите Realm**
   - Имя: `canteen` (должно совпадать с `VITE_KEYCLOAK_REALM`)

3. **Создайте Client**
   - **Client ID**: `canteen-web`
   - **Client Protocol**: `openid-connect`
   - **Access Type**: `confidential`
   - **Standard Flow Enabled**: `OFF`
   - **Direct Access Grants Enabled**: `ON`

4. **Получите Client Secret**
   - Вкладка **Credentials** → скопируйте Secret
   - Вставьте в `.env` как `KEYCLOAK_CLIENT_SECRET`

5. **Включите регистрацию**
   - **Realm Settings** → **Login** → User registration: `ON`

6. **Создайте роль admin**
   - **Realm roles** → **Create role** → `admin`

---

## 📁 Структура проекта

```
├── app/
│   ├── components/          # React компоненты
│   │   └── layout/          # Layout (Header, Footer)
│   ├── constants/           # Константы
│   ├── context/             # React Context (Auth, Cart)
│   ├── lib/                 # Утилиты (auth, db)
│   ├── routes/              # Роуты приложения
│   │   ├── home.tsx         # Главная страница
│   │   ├── cart.tsx         # Корзина
│   │   ├── login.tsx        # Авторизация
│   │   ├── profile.tsx      # Профиль
│   │   ├── admin.*.tsx      # Админ-панель
│   │   └── api.*.tsx        # API роуты
│   └── root.tsx             # Корневой компонент
├── prisma/
│   ├── schema.prisma        # Схема БД
│   └── seed.ts              # Начальные данные
├── prometheus/              # Конфиг Prometheus
├── grafana/                 # Provisioning Grafana
├── loki/                    # Конфиг Loki
├── promtail/                # Конфиг Promtail
├── tests/                   # Jest тесты
├── docker-compose.yml       # Docker Compose
└── package.json
```

---

## 🔌 API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/check-auth` | Проверка авторизации |
| POST | `/api/login` | Вход (ROPC) |
| POST | `/api/logout` | Выход |
| POST | `/api/create-order` | Создание заказа |
| GET | `/api/user-orders` | История заказов |

---

## 👥 Роли пользователей

### Студент (student)
- Просмотр меню
- Добавление в корзину
- Оформление заказов

### Администратор (admin)
- Все возможности студента
- Управление меню
- Обработка заказов
- Изменение статусов

---

## ⏰ Рабочее время

Система работает в будние дни с 08:00 до 18:00.

---

## 📝 История разработки

### Версия 1.0 (04.01.2026 — 25.02.2026)
- Инициализация проекта
- React Router v7 Framework Mode
- Keycloak SSO интеграция
- Админ-панель
- Система заказов

### Версия 1.1 (02.04.2026)
- Performance optimization (Vite)
- Bundle optimization
- Database indexes
- Security hardening (валидация API)
- SEO optimization
- Jest testing setup
- Prometheus + Grafana + Loki мониторинг

---

## 📄 Лицензия

MIT License

---

**Организация:** СибГИУ (Сибирский государственный индустриальный университет)  
**Статус:** Production Ready
