import { useState, useEffect, useRef } from "react";
import { Link, useFetcher } from "react-router";
import { 
  Clock, 
  Bell,
  Package,
  User,
  ArrowLeft,
  Filter,
  Search
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getKeycloak } from "../lib/auth.client";
import { prisma } from "../lib/db.server";
import type { Route } from "./+types/admin.orders";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Админ-панель - Заказы | Столовая СибГИУ" },
    { name: "description", content: "Управление заказами столовой СибГИУ" },
  ];
}

type OrderStatus = "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";

interface OrderItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  createdAt: Date;
  totalPrice: number;
  pickupTime: string;
  status: OrderStatus;
  userName: string;
  userGroup: string;
  items: OrderItem[];
}

export async function loader() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { orderItems: true },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      totalPrice: Number(order.totalPrice),
      pickupTime: order.pickupTime ? order.pickupTime.toISOString().slice(11, 16) : "",
      status: order.status as OrderStatus,
      userName: order.userSub || "Гость",
      userGroup: "",
      items: order.orderItems.map((item) => ({
        id: item.id,
        productName: item.productName || "Блюдо",
        price: Number(item.price),
        quantity: item.quantity,
      })),
    }));

    return { orders: formattedOrders };
  } catch (error) {
    console.error("Error loading orders:", error);
    return { orders: [] };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("status") as OrderStatus;

  if (!orderId || !newStatus) {
    return { error: "Missing required fields" };
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating order:", error);
    return { error: "Failed to update order" };
  }
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case "PENDING": return "bg-gray-100 text-gray-700";
    case "PREPARING": return "bg-[#0066CC] text-white";
    case "READY": return "bg-green-500 text-white";
    case "COMPLETED": return "bg-gray-400 text-white";
    case "CANCELLED": return "bg-red-500 text-white";
    default: return "bg-gray-100 text-gray-700";
  }
}

function getStatusText(status: OrderStatus): string {
  switch (status) {
    case "PENDING": return "Принят";
    case "PREPARING": return "Готовится";
    case "READY": return "Готов";
    case "COMPLETED": return "Выдан";
    case "CANCELLED": return "Отменён";
    default: return status;
  }
}

const statusFilters = [
  { value: "ALL", label: "Все" },
  { value: "PENDING", label: "Принят" },
  { value: "PREPARING", label: "Готовится" },
  { value: "READY", label: "Готов" },
  { value: "COMPLETED", label: "Выдан" },
  { value: "CANCELLED", label: "Отменён" },
];

export default function AdminOrders({ loaderData }: Route.ComponentProps) {
  const { orders } = loaderData;
  const { isAuthenticated, hasRole, user } = useAuth();
  const fetcher = useFetcher();
  
  const keycloak = getKeycloak();
  const tokenParsed = keycloak?.tokenParsed;

  const checkIsAdmin = (): boolean => {
    if (!tokenParsed) return false;
    if (hasRole("admin")) return true;
    const realmRoles = tokenParsed.realm_access?.roles || [];
    if (realmRoles.some((r: string) => r.toLowerCase() === "admin")) return true;
    const clientRoles = tokenParsed.resource_access?.["canteen-web"]?.roles || [];
    if (clientRoles.some((r: string) => r.toLowerCase() === "admin")) return true;
    if (tokenParsed.preferred_username === "admin_sibsui") return true;
    return false;
  };

  const isAdmin = checkIsAdmin();
  
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const prevPendingRef = useRef(0);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Требуется авторизация</h1>
          <Link to="/profile" className="text-sib-blue hover:underline">Войти в систему</Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-2 text-sib-blue hover:underline">
            <ArrowLeft className="w-4 h-4" />На главную
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-red-900 mb-2">Доступ запрещён</h1>
          <p className="text-red-700">У вас нет прав администратора</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Диагностика</h2>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Токен (decoded):</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded-xl overflow-x-auto text-xs">
              {JSON.stringify(tokenParsed, null, 2)}
            </pre>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Проверки:</h3>
            <ul className="space-y-1 text-sm">
              <li>hasRole("admin"): {hasRole("admin") ? "✓" : "✗"}</li>
              <li>realm_access.roles: {JSON.stringify(tokenParsed?.realm_access?.roles || [])}</li>
              <li>preferred_username: {tokenParsed?.preferred_username || "нет"}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "ALL" && order.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!order.id.toLowerCase().includes(query) && !order.userName.toLowerCase().includes(query)) return false;
    }
    return true;
  });

  useEffect(() => {
    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    if (pendingOrders > prevPendingRef.current && prevPendingRef.current > 0) {
      if (audioRef.current) audioRef.current.play().catch(() => {});
    }
    setPendingCount(pendingOrders);
    prevPendingRef.current = pendingOrders;
  }, [orders]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    fetcher.submit({ orderId, status: newStatus }, { method: "post" });
  };

  const formatDate = (date: Date) => new Date(date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  const formatTime = (date: Date) => new Date(date).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="container mx-auto px-4 py-8">
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp2XjoCAgIaUn56agYF/d3N0g4iIiYOAenZ1g4mJiYR9enZ0g4mJiYR7eXdzg4mJiYR7eXdzg4mJiYR6eXdzg4mJiYR6eXdzg4mJiYR5eXdzg4mJiYR5eXdzg4mJiYR5eXdzg4mJiYR5eXdzg4mJiYR5eXdzg4mJiYR5eXdzg4mJiYR5eXdzg4mJiYQ=" preload="auto" />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-xl hover:bg-gray-100"><ArrowLeft className="w-6 h-6 text-gray-600" /></Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Заказы</h1>
            <p className="text-gray-600">Администратор: {user?.fullName || user?.username}</p>
          </div>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl">
            <Bell className="w-5 h-5 animate-pulse" /><span className="font-semibold">{pendingCount} новых</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Поиск..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sib-blue" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sib-blue">
              {statusFilters.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </select>
          </div>
          <div className="text-gray-500">Найдено: <span className="font-semibold text-gray-900">{filteredOrders.length}</span></div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Заказы не найдены</h2>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-900">#{order.id.slice(-6)}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                </div>
                <div className="text-gray-500 text-sm">{formatDate(order.createdAt)} в {formatTime(order.createdAt)}</div>
              </div>

              <div className="flex items-center gap-6 mb-4 text-gray-600">
                <div className="flex items-center gap-2"><User className="w-4 h-4" /><span>{order.userName}</span></div>
                {order.pickupTime && (<div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span className="font-semibold text-sib-blue">{order.pickupTime}</span></div>)}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between"><span className="text-gray-700">{item.quantity > 1 && `${item.quantity} × `}{item.productName}</span><span className="font-semibold">{item.price * item.quantity}₽</span></div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between"><span className="font-bold">Итого:</span><span className="text-2xl font-bold text-sib-blue">{order.totalPrice}₽</span></div>
              </div>

              <div className="flex gap-2 justify-end">
                {order.status === "PENDING" && (<><button onClick={() => handleStatusChange(order.id, "PREPARING")} className="px-4 py-2 bg-sib-blue hover:bg-blue-700 text-white font-medium rounded-xl">Готовится</button><button onClick={() => handleStatusChange(order.id, "CANCELLED")} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl">Отменить</button></>)}
                {order.status === "PREPARING" && (<button onClick={() => handleStatusChange(order.id, "READY")} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl">Готов</button>)}
                {order.status === "READY" && (<button onClick={() => handleStatusChange(order.id, "COMPLETED")} className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-xl">Выдан</button>)}
                {(order.status === "COMPLETED" || order.status === "CANCELLED") && (<span className="text-gray-400 px-4 py-2">Завершено</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
