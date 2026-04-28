import { useState, useEffect } from "react";
import { Link, useNavigate, useLoaderData } from "react-router";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, Clock, CheckCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import TimeSlotPicker from "../components/TimeSlotPicker";
import { useConfirm } from "../components/ui/ConfirmModal";

export async function loader() {
  const { prisma } = await import("../lib/db.server");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const slots = await prisma.timeSlot.findMany({
    where: { isEnabled: true },
    orderBy: { startTime: 'asc' },
    include: {
      _count: {
        select: {
          orders: {
            where: {
              scheduledDate: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
              },
              status: { not: 'CANCELLED' }
            }
          }
        }
      }
    }
  });

  return {
    slots: slots.map(slot => ({
      id: slot.id,
      label: slot.label,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
      booked: slot._count.orders
    }))
  };
}

export function meta() {
  return [
    { title: "Корзина - Столовая СибГИУ" },
    { name: "description", content: "Оформите заказ в столовой СибГИУ" },
  ];
}

export default function Cart() {
  const { slots } = useLoaderData<typeof loader>();
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { confirm } = useConfirm();

  // Прокрутка страницы наверх при загрузке
  useEffect(() => {
    // Используем requestAnimationFrame чтобы дождаться полной отрисовки контента
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, []);

  // Сбрасываем выбранный слот если корзина пустая
  useEffect(() => {
    if (items.length === 0 && selectedSlotId) {
      setSelectedSlotId(null);
    }
  }, [items.length, selectedSlotId]);

  const canCheckout = selectedSlotId !== null;

  const handleCheckout = async () => {
    // Проверка на пустую корзину
    if (items.length === 0) {
      setError("Корзина пуста. Добавьте блюда из меню");
      return;
    }
    if (!selectedSlotId) {
      setError("Выберите время получения");
      return;
    }
    if (!isAuthenticated) {
      navigate("/profile");
      return;
    }

    setIsSubmitting(true);
    setError("");

    // Создаём заказ
    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          timeSlotId: selectedSlotId,
          totalPrice,
        }),
      });
      
      if (response.ok) {
        // Очищаем корзину
        clearCart();
        setSelectedSlotId(null);
        // Показываем сообщение об успехе
        toast.success("Заказ успешно создан!", {
          description: "Статус: Готовится. Ожидайте уведомления когда заказ будет готов.",
          duration: 4000,
        });
        navigate("/profile");
      } else {
        if (response.status === 409) {
          // Слот уже заполнен
          toast.error("Слот уже занят", {
            description: "Выбранное время только что заполнилось. Пожалуйста выберите другой слот.",
            duration: 5000,
          });
          setSelectedSlotId(null);
        } else {
          const data = await response.json();
          setError(data.error || "Ошибка создания заказа");
        }
      }
    } catch (e) {
      toast.error("Ошибка соединения", {
        description: "Не удалось создать заказ. Проверьте интернет соединение и попробуйте снова.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Список товаров */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-md p-4 flex gap-4">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-2xl font-bold text-[#0066CC] mb-3">{item.price * item.quantity}₽</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 md:w-11 md:h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="font-medium w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 md:w-11 md:h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <button 
                onClick={async () => {
                  const confirmed = await confirm({
                    title: `Удалить "${item.name}"?`,
                    confirmText: "Удалить",
                    cancelText: "Отмена"
                  });
                  
                  if (confirmed) {
                    removeItem(item.id);
                  }
                }} 
                className="self-start p-2 text-gray-400 hover:text-red-500"
              >
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
              <TimeSlotPicker
                slots={slots}
                selectedSlotId={selectedSlotId}
                onSelect={(slotId) => {
                  setSelectedSlotId(slotId);
                  setError("");
                }}
              />

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
              disabled={!canCheckout || isSubmitting}
              className={`block w-full font-semibold py-4 px-6 rounded-xl text-center transition-all ${
                isSubmitting ? "bg-blue-400 text-white cursor-wait" :
                canCheckout ? "bg-[#0066CC] hover:bg-[#0052A3] text-white cursor-pointer" : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Создаём заказ..." : "Оплатить заказ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}