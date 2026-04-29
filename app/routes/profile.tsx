import { useState, useEffect } from "react";
import { Link } from "react-router";
import { User, LogOut, ShoppingBag, Settings, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../components/ui/ConfirmModal";
import type { Route } from "./+types/profile";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Профиль - Столовая СибГИУ" },
    { name: "description", content: "Личный кабинет студента СибГИУ" },
  ];
}

export default function Profile() {
  const { user, isAuthenticated, isLoading, logout, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<"orders" | "settings">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { confirm } = useConfirm();

  // Загружаем заказы при монтировании
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/user-orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Не авторизован
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Требуется авторизация</h1>
          <p className="text-gray-600 mb-8">Войдите через систему СибГИУ</p>
          <Link
            to="/login"
            className="inline-block bg-[#0066CC] hover:bg-[#0052A3] text-white font-medium py-3 px-6 rounded-xl"
          >
            Войти через СибГИУ
          </Link>
        </div>
      </div>
    );
  }

  // Загрузка
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
      </div>
    );
  }

  const isAdmin = hasRole("admin");
  
  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Вы действительно хотите выйти из аккаунта?",
      confirmText: "Выйти",
      cancelText: "Отмена"
    });
    
    if (confirmed) {
      try {
        await fetch("/api/logout", { method: "POST", credentials: "include" });
      } finally {
        logout();
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED": return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700"><CheckCircle className="w-3 h-3" /> Выдан</span>;
      case "READY": return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" /> Готов</span>;
      case "PREPARING": return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[#0066CC] text-white"><Clock className="w-3 h-3" /> Готовится</span>;
      case "PENDING": return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3" /> Принят</span>;
      case "CANCELLED": return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white"><XCircle className="w-3 h-3" /> Отменён</span>;
      default: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#0066CC] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.fullName || user?.username}</h1>
              {user?.group && <p className="text-gray-600">Группа: {user.group}</p>}
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-2 bg-[#9B59B6] hover:bg-[#8E44AD] text-white font-medium py-2 px-4 rounded-xl">
                <Settings className="w-5 h-5" /> Админ-панель
              </Link>
            )}
            <button onClick={handleLogout} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl">
              <LogOut className="w-5 h-5" /> Выйти
            </button>
          </div>
        </div>
      </div>

      {/* Табы */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab("orders")} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${activeTab === "orders" ? "bg-[#0066CC] text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
          <ShoppingBag className="w-5 h-5" /> История заказов
        </button>
        <button onClick={() => setActiveTab("settings")} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${activeTab === "settings" ? "bg-[#0066CC] text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
          <Settings className="w-5 h-5" /> Настройки
        </button>
      </div>

      {/* Заказы */}
      {activeTab === "orders" && (
        <div>
          {loadingOrders ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066CC]"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">У вас пока нет заказов</h2>
              <p className="text-gray-600 mb-4">Оформите первый заказ в нашей столовой!</p>
              <Link to="/" className="inline-flex bg-[#0066CC] hover:bg-[#0052A3] text-white font-medium py-2 px-4 rounded-xl">
                Перейти в меню
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-sm text-gray-500">Заказ #{order.orderNumber}</span>
                      <p className="text-sm text-gray-600">{order.pickupTime ? new Date(order.pickupTime).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "Не указано"}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    {order.orderItems?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.productName} x{item.quantity}</span>
                        <span className="font-medium">{item.price * item.quantity}₽</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <span className="font-bold">Итого:</span>
                    <span className="font-bold text-[#0066CC]">{order.totalPrice}₽</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Настройки */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Настройки профиля</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
              <input type="text" defaultValue={user?.fullName} disabled className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" defaultValue={user?.email} disabled className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Группа</label>
              <input type="text" defaultValue={user?.group || "Не указана"} disabled className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" />
            </div>
            <p className="text-sm text-gray-500">Для изменения данных обратитесь к администратору.</p>
          </div>
        </div>
      )}
    </div>
  );
}
