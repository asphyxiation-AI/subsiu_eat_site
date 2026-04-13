import { useLoaderData, useRevalidator } from "react-router";
import { useEffect } from "react";

export async function loader() {
  const { prisma } = await import("../lib/db.server");
  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: ["PREPARING", "READY"],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      timeSlot: true
    },
  });
  return { orders };
}

export default function OrdersScreen() {
  const { orders } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 5000);
    return () => clearInterval(interval);
  }, [revalidator]);

  // Группируем заказы по временным слотам
  const groupBySlot = (orderList) => {
    const groups = {};

    orderList.forEach(order => {
      const slotKey = order.timeSlot
        ? `${order.timeSlot.label} (${order.timeSlot.startTime} - ${order.timeSlot.endTime})`
        : 'Без времени';

      if (!groups[slotKey]) {
        groups[slotKey] = [];
      }
      groups[slotKey].push(order);
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  const preparingGroups = groupBySlot(orders.filter(o => o.status === "PREPARING"));
  const readyGroups = groupBySlot(orders.filter(o => o.status === "READY"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-2 tracking-tight">
            Статус заказов
          </h1>
          <p className="text-gray-500 text-lg">Обновляется автоматически каждые 5 секунд</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Готовятся */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] px-8 py-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="bg-white/20 px-4 py-1 rounded-xl">
                  {orders.filter(o => o.status === "PREPARING").length}
                </span>
                Готовятся
              </h2>
            </div>
            <div className="p-8">
              {preparingGroups.map(([slotName, slotOrders]) => (
                <div key={slotName} className="mb-6 last:mb-0">
                  <div className="font-bold text-gray-700 mb-3 text-lg">{slotName}</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {slotOrders.map((order, index) => (
                      <div
                        key={order.id}
                        className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-5 text-center transform transition-all hover:scale-105 hover:shadow-lg"
                      >
                        <div className="text-5xl font-black text-orange-700">
                          №{order.orderNumber}
                        </div>
                        <div className="mt-2 text-sm font-medium text-orange-600">
                          В процессе
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {preparingGroups.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-xl">
                  <div className="text-6xl mb-4">🍽️</div>
                  Пока нет заказов в готовке
                </div>
              )}
            </div>
          </div>

          {/* Готовы */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#10B981] to-[#059669] px-8 py-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="bg-white/20 px-4 py-1 rounded-xl">
                  {orders.filter(o => o.status === "READY").length}
                </span>
                Готовы к выдаче
              </h2>
            </div>
            <div className="p-8">
              {readyGroups.map(([slotName, slotOrders]) => (
                <div key={slotName} className="mb-6 last:mb-0">
                  <div className="font-bold text-gray-700 mb-3 text-lg">{slotName}</div>
                  <div className="flex flex-wrap gap-6 justify-center">
                    {slotOrders.map((order, index) => (
                      <div
                        key={order.id}
                        className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl px-10 py-8 shadow-2xl transform transition-all hover:scale-110 cursor-pointer"
                        style={{ animation: 'pulse 2s infinite' }}
                      >
                        <div className="text-7xl font-black">
                          №{order.orderNumber}
                        </div>
                        <div className="mt-3 text-center text-green-100 font-medium">
                          ✅ Заберите заказ
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {readyGroups.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-xl">
                  <div className="text-6xl mb-4">⏳</div>
                  Ожидаем готовых заказов
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(16, 185, 129, 0);
          }
        }
      `}</style>
    </div>
  );
}