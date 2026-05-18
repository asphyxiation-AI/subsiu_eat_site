import { Link, isRouteErrorResponse } from "react-router";
import { Home, AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error: unknown;
}

export default function ErrorPage({ error }: ErrorPageProps) {
  let title = "Что-то пошло не так";
  let message = "Произошла непредвиденная ошибка. Пожалуйста, попробуйте обновить страницу.";
  let showHomeButton = false;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      // 404 уже обрабатывается отдельной страницей .404.tsx
      // но на всякий случай покажем красивую ошибку
      title = "Страница не найдена";
      message = "Запрашиваемая страница не существует. Возможно, она была удалена или перемещена.";
      showHomeButton = true;
    } else if (error.status === 403) {
      title = "Доступ запрещён";
      message = "У вас нет прав для просмотра этой страницы. Пожалуйста, войдите в систему с соответствующими правами.";
      showHomeButton = true;
    } else if (error.status === 401) {
      title = "Требуется авторизация";
      message = "Для доступа к этой странице необходимо войти в систему.";
      showHomeButton = true;
    } else {
      title = `Ошибка ${error.status}`;
      message = error.statusText || "Произошла ошибка при обработке запроса.";
      showHomeButton = true;
    }
  } else if (error instanceof Error) {
    message = error.message || "Неизвестная ошибка";
  }

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-16 h-16 text-red-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-sib-blue mb-4">
          {title}
        </h1>
        
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {showHomeButton && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-sib-blue hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all hover:scale-105 transform"
            >
              <Home className="w-5 h-5" />
              На главную
            </Link>
          )}
          
          <button
            onClick={handleReload}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all hover:scale-105 transform cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" />
            Обновить страницу
          </button>
        </div>
      </div>
    </div>
  );
}