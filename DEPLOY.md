# 🚀 Полная инструкция по развертыванию проекта на чистом сервере

> Инструкция для Windows Server / Windows 10/11. Подходит для виртуальной машины в ВУЗе.

---

## 📋 Требования к серверу
| Компонент | Минимальная версия |
|-----------|--------------------|
| Node.js   | 20.x или выше      |
| PostgreSQL| 15.x или выше      |
| Git       | Любая актуальная  |
| ОЗУ       | Минимум 4 ГБ       |
| Диск      | Минимум 20 ГБ      |

---

## 🛠️ Шаг 1: Установка необходимого ПО

1.  **Установить Node.js LTS 20.x**
    ```
    https://nodejs.org/dist/v20.17.0/node-v20.17.0-x64.msi
    ```
    ✅ При установке ОБЯЗАТЕЛЬНО поставить галочку "Automatically install the necessary tools"

2.  **Установить Git**
    ```
    https://git-scm.com/download/win
    ```

3.  **Установить PostgreSQL 16**
    ```
    https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
    ```
    ✅ При установке запомнить пароль пользователя `postgres`

---

## 📥 Шаг 2: Клонирование проекта

1.  Открыть командную строку от имени Администратора
2.  Перейти в папку где будет лежать проект:
    ```cmd
    cd C:\
    ```
3.  Склонировать репозиторий:
    ```cmd
    git clone https://github.com/asphyxiation-AI/subsiu_eat_site.git
    cd subsiu_eat_site
    ```

---

## ⚙️ Шаг 3: Установка зависимостей

```cmd
npm install
```

✅ Дождаться полной установки всех пакетов. Это может занять 2-5 минут.

---

## 🗄️ Шаг 4: Настройка базы данных

1.  Скопировать файл `.env.example` и переименовать в `.env`
2.  Открыть файл `.env` в редакторе
3.  Указать правильные данные для подключения к PostgreSQL:
    ```env
    DATABASE_URL="postgresql://postgres:ТВОЙ_ПАРОЛЬ@localhost:5432/subsiu_eat?schema=public"
    ```
4.  Создать базу данных и применить миграции:
    ```cmd
    npx prisma migrate deploy
    ```
5.  Заполнить базу начальными данными:
    ```cmd
    npx prisma db seed
    ```

---

## 🔑 Шаг 5: Настройка Keycloak

1.  Скачать Keycloak 25:
    ```
    https://github.com/keycloak/keycloak/releases/download/25.0.6/keycloak-25.0.6.zip
    ```
2.  Распаковать в `C:\keycloak`
3.  Запустить Keycloak:
    ```cmd
    cd C:\keycloak\bin
    kc.bat start-dev --http-port 8080
    ```
4.  Открыть в браузере `http://localhost:8080/admin`
5.  Создать реалм `subsiu`, импортировать конфиг из папки `keycloak/realms`

---

## ▶️ Шаг 6: Запуск проекта

✅ Для разработки:
```cmd
npm run dev
```

✅ Для продакшена:
1.  Собрать проект:
    ```cmd
    npm run build
    ```
2.  Запустить сервер:
    ```cmd
    npm start
    ```

✅ Сайт будет доступен по адресу:
```
http://localhost:5173
```

---

## 🎯 Первый запуск

1.  Открыть `http://localhost:5173`
2.  Перейти на страницу логина `/login`
3.  Данные администратора по умолчанию:
    ```
    Логин: admin
    Пароль: admin123
    ```

---

## 🚀 Автозапуск при старте системы

1.  Установить pm2 глобально:
    ```cmd
    npm install -g pm2
    ```
2.  Запустить проект через pm2:
    ```cmd
    pm2 start ecosystem.config.cjs
    ```
3.  Сохранить список процессов:
    ```cmd
    pm2 save
    ```
4.  Настроить автозапуск:
    ```cmd
    pm2 startup
    ```

---

