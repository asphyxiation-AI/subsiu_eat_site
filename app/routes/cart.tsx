import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, Clock, CheckCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ORDER_START_TIME, ORDER_END_TIME, SKIP_TIME_CHECK, TIMEZONE } from "../constants/config";
import type { Route } from "./+types/cart";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Корзина - Столовая СибГИУ" },
    { name: "description", content: "Оформите заказ в столовой СибГИУ" },
  ];
}

// Генерируем временные слоты
function generateTimeSlots() {
  const slots = [];
  const [startHour, startMinute] = ORDER_START_TIME.split(":").map(Number);
  const [endHour, endMinute] = ORDER_END_TIME.split(":").map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    slots.push(`${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`);
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute = 0;
    }
  }
  return slots;
}

// Проверка прошедшего времени
function isTimePassed(time: string): boolean {
  if (SKIP_TIME_CHECK) return false;
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("ru-RU", { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit", hour12: false });
  return time <= formatter.format(now);
}

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Прокрутка страницы наверх при загрузке
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const timeSlots = generateTimeSlots();
  const canCheckout = selectedTime && !isTimePassed(selectedTime);

  const handleCheckout = async () => {
    // Проверка на пустую корзину
    if (items.length === 0) {
      setError("Корзина пуста. Добавьте блюда из меню");
      return;
    }
    if (!selectedTime) {
      setError("Выберите время получения");
      return;
    }
    if (isTimePassed(selectedTime)) {
      setError("Выбранное время уже прошло");
      return;
    }
    if (!isAuthenticated) {
      navigate("/profile");
      return;
    }

    // Создаём заказ
    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          pickupTime: selectedTime,
          totalPrice,
        }),
      });
      
      if (response.ok) {
        // Очищаем корзину
        items.forEach(item => removeItem(item.id));
        setSelectedTime(null);
        // Показываем сообщение об успехе
        alert("Заказ успешно создан! Статус: Готовится");
        navigate("/profile");
      } else {
        const data = await response.json();
        setError(data.error || "Ошибка создания заказа");
      }
    } catch (e) {
      setError("Ошибка соединения");
    }
  };

  // Пустая корзина
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-16 h-16 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ваша корзина пуста</h1>
          <p className="text-gray-600 mb-8">Выберите блюда из нашего меню!</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052A3] text-white font-medium py-3 px-6 rounded-xl">
            <ArrowLeft className="w-5 h-5" /> Перейти в меню
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Корзина</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Список товаров */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-md p-4 flex gap-4">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-2xl font-bold text-[#0066CC] mb-3">{item.price * item.quantity}₽</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="font-medium w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} className="self-start p-2 text-gray-400 hover:text-red-500">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Панель оформления */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Оформление заказа</h2>
            
            {!isAuthenticated && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  Для оформления <Link to="/profile" className="underline font-medium">войдите в систему</Link>
                </p>
              </div>
            )}
            
            {/* Выбор времени */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-[#0066CC]" />
                <label className="font-medium text-gray-700">Выберите время получения</label>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {timeSlots.map((time) => {
                  const passed = isTimePassed(time);
                  return (
                    <button
                      key={time}
                      disabled={passed}
                      onClick={() => { setSelectedTime(time); setError(""); }}
                      className={`py-2 rounded-lg text-sm font-medium ${
                        selectedTime === time ? "bg-[#0066CC] text-white" :
                        passed ? "bg-gray-100 text-gray-300 line-through" :
                        "bg-gray-50 text-gray-700 hover:bg-orange-500 hover:text-white"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {/* Итого */}
            <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between mb-2"><span className="text-gray-600">Товаров:</span><span className="font-medium">{totalItems}</span></div>
              <div className="flex justify-between mb-2"><span className="text-gray-600">На сумму:</span><span className="font-medium">{totalPrice}₽</span></div>
              <div className="flex justify-between text-lg font-bold"><span>Итого:</span><span className="text-[#0066CC]">{totalPrice}₽</span></div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!canCheckout}
              className={`block w-full font-semibold py-4 px-6 rounded-xl text-center ${
                canCheckout ? "bg-[#0066CC] hover:bg-[#0052A3] text-white cursor-pointer" : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Оплатить заказ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
