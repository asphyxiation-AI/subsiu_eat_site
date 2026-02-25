/**
 * PM2 конфигурация для запуска приложения столовой СибГИУ
 * 
 * Установка: npm install -g pm2
 * Запуск: pm2 start ecosystem.config.js
 * Остановка: pm2 stop ecosystem.config.js
 * Логи: pm2 logs
 * Мониторинг: pm2 monit
 */

module.exports = {
  apps: [
    {
      name: 'sibsiu-canteen',
      script: './build/server/index.js',
      
      // Режим работы
      instances: 1,           // Количество инстансов (для продакшена - max)
      exec_mode: 'cluster',    // cluster или fork
      
      // Автоперезапуск
      autorestart: true,
      watch: false,           // Не отслеживать изменения в продакшене
      max_memory_restart: '500M', // Перезапуск при превышении 500MB памяти
      
      // Окружение
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // Логи
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000,
      
      // Дополнительные настройки
      max_restarts: 10,
      min_uptime: '10s',
      
      // Параметры для Docker (если используется)
      // docker: {
      //   image: 'node:20-alpine'
      // }
    }
  ]
};
