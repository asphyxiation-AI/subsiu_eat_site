import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { LogIn, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function meta() {
  return [
    { title: "Вход - Столовая СибГИУ" },
    { name: "description", content: "Вход в систему столовой СибГИУ" },
  ];
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Ошибка входа");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066CC] via-[#0099FF] to-[#00AAFF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Кнопка назад */}
        <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors no-underline">
          <ArrowLeft className="w-5 h-5" /> На главную
        </Link>

        {/* Карточка входа */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#0066CC] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">С</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Вход в систему</h1>
            <p className="text-gray-500 mt-2">Авторизуйтесь через Keycloak</p>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Ошибка авторизации</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Успех */}
          {error.includes("Клиент не настроен") && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl mb-6 p-4">
              <p className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Требуется настройка Keycloak
              </p>
              <p className="text-sm text-yellow-700 mb-3">
                Проверьте настройки клиента в Keycloak Admin Console
              </p>
            </div>
          )}

          {/* Форма входа */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Логин (username)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите логин"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052A3] disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Войти
                </>
              )}
            </button>
          </form>

          {/* Тестовые аккаунты - только в dev режиме */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm">
              <p className="font-medium text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Тестовые аккаунты:
              </p>
              <div className="space-y-2 text-green-700">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Админ:</span>
                  <code className="bg-green-100 px-2 py-1 rounded">admin</code>
                  <span>/</span>
                  <code className="bg-green-100 px-2 py-1 rounded">admin123</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Студент:</span>
                  <code className="bg-green-100 px-2 py-1 rounded">student</code>
                  <span>/</span>
                  <code className="bg-green-100 px-2 py-1 rounded">student123</code>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Информация внизу */}
        <div className="text-center mt-6 text-white/60 text-sm">
          <p>Столовая СибГИУ © 2026</p>
        </div>
      </div>
    </div>
  );
}
