import { Link } from "react-router";
import { Utensils, ShoppingBag, ArrowLeft, Monitor, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function meta() {
  return [
    { title: "Панель управления - Столовая СибГИУ" },
    { name: "description", content: "Админ-панель столовой СибГИУ" },
  ];
}

export default function AdminDashboard() {
  const { isAuthenticated, hasRole, user } = useAuth();
  
  // Проверка роли админа через AuthContext
  const isAdmin = hasRole("admin");

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Требуется авторизация</h1>
          <Link to="/profile" className="text-sib-blue hover:underline">
            Войти в систему
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещён</h1>
          <p className="text-gray-600 mb-4">У вас нет прав администратора</p>
          <Link to="/" className="text-sib-blue hover:underline">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
          <p className="text-gray-600">Администратор: {user?.fullName || user?.username}</p>
        </div>
      </div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
<Link to="/admin/menu" className="group bg-gradient-to-br from-[#005FB8] to-[#003D7C] rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <Utensils className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Управление меню</h2>
          <p className="text-white/80 mb-4">Добавляйте, редактируйте и удаляйте блюда в меню столовой</p>
          <div className="flex items-center gap-2 text-sm font-medium text-white/90 group-hover:text-white">Перейти →</div>
        </Link>

        <Link to="/admin/time-slots" className="group bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Временные интервалы</h2>
          <p className="text-white/80 mb-4">Настройка расписания и лимитов на заказы</p>
          <div className="flex items-center gap-2 text-sm font-medium text-white/90 group-hover:text-white">Перейти →</div>
        </Link>

        <Link to="/admin/orders" className="group bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Работа с заказами</h2>
          <p className="text-white/80 mb-4">Просматривайте и обрабатывайте заказы клиентов</p>
          <div className="flex items-center gap-2 text-sm font-medium text-white/90 group-hover:text-white">Перейти →</div>
        </Link>

        <a href="/admin/orders-screen" target="_blank" className="group bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <Monitor className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Окно заказов</h2>
          <p className="text-white/80 mb-4">Отображение статуса заказов в реальном времени</p>
          <div className="flex items-center gap-2 text-sm font-medium text-white/90 group-hover:text-white">Открыть в новой вкладке →</div>
        </a>
      </div>
    </div>
  );
}
