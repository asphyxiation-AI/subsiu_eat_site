import { useLoaderData, useNavigation } from "react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { useConfirm } from "../components/ui/ConfirmModal";

export async function loader() {

  const { prisma } = await import("../lib/db.server");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const slots = await prisma.timeSlot.findMany({
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

  return { slots };
}

export async function action({ request }) {

  const { prisma } = await import("../lib/db.server");
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const time = formData.get("time") as string;
    const capacity = parseInt(formData.get("capacity") as string);
    
    if (!time?.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) throw new Error("Неверный формат времени");
    if (isNaN(capacity) || capacity < 1 || capacity > 500) throw new Error("Неверная вместимость");

    await prisma.timeSlot.create({
      data: {
        label: time,
        startTime: time,
        endTime: time,
        capacity
      }
    });
    return { ok: true };
  }

  if (intent === "toggle") {
    const id = formData.get("id") as string;
    const slot = await prisma.timeSlot.findUnique({ where: { id } });
    await prisma.timeSlot.update({
      where: { id },
      data: { isEnabled: !slot?.isEnabled }
    });
    return { ok: true };
  }

  if (intent === "delete") {
    const id = formData.get("id") as string;
    await prisma.timeSlot.delete({ where: { id } });
    return { ok: true };
  }

  if (intent === "deleteAll") {
    await prisma.timeSlot.deleteMany();
    return { ok: true };
  }

  if (intent === "toggleAll") {
    const anyEnabled = await prisma.timeSlot.findFirst({ where: { isEnabled: true } });
    await prisma.timeSlot.updateMany({ data: { isEnabled: !anyEnabled } });
    return { ok: true };
  }

  if (intent === "updateCapacity") {
    const id = formData.get("id") as string;
    const capacity = parseInt(formData.get("capacity") as string);
    
    // Валидация на сервере
    if (isNaN(capacity) || capacity < 1 || capacity > 500) {
      throw new Error("Вместимость должна быть числом от 1 до 500");
    }

    await prisma.timeSlot.update({
      where: { id },
      data: { capacity }
    });
    return { ok: true };
  }

  if (intent === "generate") {
    const startTime = formData.get("genStartTime") as string;
    const endTime = formData.get("genEndTime") as string;
    const step = parseInt(formData.get("genStep") as string);
    const capacity = parseInt(formData.get("genCapacity") as string);

    if (isNaN(step) || step < 1 || step > 180) throw new Error("Шаг должен быть от 1 до 180 минут");
    if (isNaN(capacity) || capacity < 1 || capacity > 500) throw new Error("Вместимость должна быть от 1 до 500");

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) throw new Error("Неверный формат времени");
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes >= endMinutes) throw new Error("Время начала должно быть раньше времени окончания");

    const slotsToCreate = [];
    
    for (let time = startMinutes; time <= endMinutes; time += step) {
      const h = Math.floor(time / 60);
      const m = time % 60;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      
      slotsToCreate.push({
        label: timeStr,
        startTime: timeStr,
        endTime: timeStr,
        capacity,
        isEnabled: true
      });
    }

    await prisma.timeSlot.createMany({
      data: slotsToCreate,
      skipDuplicates: true
    });

    return { ok: true, created: slotsToCreate.length };
  }

  return { ok: false };
}

export default function AdminTimeSlots() {
  const { slots } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const { isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [genStartTime, setGenStartTime] = useState("08:00");
  const [genEndTime, setGenEndTime] = useState("16:00");
  const [genStep, setGenStep] = useState(5);
  const [genCapacity, setGenCapacity] = useState(30);
  const { confirm } = useConfirm();

  const isSubmitting = navigation.state === "submitting";

  // ✅ ЗАЩИТА НА КЛИЕНТЕ
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Требуется авторизация</h1>
        </div>
      </div>
    );
  }

  if (!hasRole("admin")) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-red-900 mb-2">Доступ запрещён</h1>
          <p className="text-red-700">У вас нет прав администратора</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Временные моменты</h1>
            <p className="text-gray-600 mt-1">Управление точным временем для выдачи заказов</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Добавить
            </button>
            <button
              onClick={() => setShowGenerator(!showGenerator)}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl font-medium transition-colors"
            >
              ⚡ Генератор
            </button>
            <form method="post">
              <input type="hidden" name="intent" value="toggleAll" />
              <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium transition-colors">
                ⇄ Переключить все
              </button>
            </form>
            <form method="post" onSubmit={async (e) => {
              e.preventDefault();
              
              const confirmed = await confirm({
                title: "Удалить ВСЕ временные интервалы?",
                message: "Это действие нельзя отменить!",
                confirmText: "Удалить все",
                cancelText: "Отмена"
              });
              
              if (confirmed) {
                e.target.submit();
              }
            }}>
              <input type="hidden" name="intent" value="deleteAll" />
              <button type="submit" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-medium transition-colors">
                🗑️ Удалить все
              </button>
            </form>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Новый временной момент</h3>
          <form method="post" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="hidden" name="intent" value="create" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Время</label>
              <input name="time" type="time" className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Макс. заказов</label>
              <input name="capacity" type="number" min="1" defaultValue="30" className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
                Создать
              </button>
            </div>
          </form>
        </div>
      )}

      {showGenerator && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">⚡ Автоматическая генерация временных моментов</h3>
          <form method="post" className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <input type="hidden" name="intent" value="generate" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Время начала</label>
              <input 
                type="time" 
                name="genStartTime" 
                value={genStartTime}
                onChange={(e) => setGenStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Время окончания</label>
              <input 
                type="time" 
                name="genEndTime" 
                value={genEndTime}
                onChange={(e) => setGenEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Шаг (минут)</label>
              <select 
                name="genStep" 
                value={genStep}
                onChange={(e) => setGenStep(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="5">Каждые 5 минут</option>
                <option value="10">Каждые 10 минут</option>
                <option value="15">Каждые 15 минут</option>
                <option value="30">Каждые 30 минут</option>
                <option value="60">Каждые 60 минут</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Макс. заказов</label>
              <input 
                type="number" 
                name="genCapacity" 
                min="1" 
                max="200"
                value={genCapacity}
                onChange={(e) => setGenCapacity(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2" 
                required 
              />
            </div>
            <div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-medium">
                Сгенерировать
              </button>
            </div>
            <div className="md:col-span-5 text-sm text-gray-500 mt-2">
              💡 Будет создано ровно {Math.floor((((parseInt(genEndTime.split(':')[0]) * 60 + parseInt(genEndTime.split(':')[1])) - (parseInt(genStartTime.split(':')[0]) * 60 + parseInt(genStartTime.split(':')[1]))) / genStep) + 1)} временных точек
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {slots.map((slot) => {
          const ordersCount = slot._count.orders;
          const fillPercent = Math.round((ordersCount / slot.capacity) * 100);
          const isAlmostFull = fillPercent >= 80;
          const isFull = fillPercent >= 100;

          return (
            <div key={slot.id} className={`bg-white rounded-xl shadow-lg border-2 transition-all ${slot.isEnabled ? 'border-gray-200' : 'border-gray-100 opacity-50'}`}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{slot.label}</h3>

                  <form method="post">
                    <input type="hidden" name="intent" value="toggle" />
                    <input type="hidden" name="id" value={slot.id} />
                    <button type="submit" className="text-gray-400 hover:text-gray-600">
                      {slot.isEnabled
                        ? <ToggleRight className="w-8 h-8 text-green-500" />
                        : <ToggleLeft className="w-8 h-8 text-gray-400" />
                      }
                    </button>
                  </form>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Загруженность</span>
                    <span className={`font-bold ${isFull ? 'text-red-600' : isAlmostFull ? 'text-amber-600' : 'text-green-600'}`}>
                      {ordersCount} / {slot.capacity}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${isFull ? 'bg-red-500' : isAlmostFull ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(fillPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <form method="post" className="flex-1">
                    <input type="hidden" name="intent" value="updateCapacity" />
                    <input type="hidden" name="id" value={slot.id} />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-600">Лимит:</span>
                      <input
                        name="capacity"
                        type="text"
                        inputMode="numeric"
                        min="1"
                        max="500"
                        defaultValue={slot.capacity}
                        data-original={slot.capacity}
                        className="w-16 border border-gray-200 rounded-lg px-1 py-1 text-center text-sm"
                        onInput={(e) => {
                          // Только цифры
                          (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/\D/g, '');
                        }}
                        onBlur={(e) => {
                          const input = e.target as HTMLInputElement;
                          const val = parseInt(input.value);
                          const original = parseInt(input.dataset.original || "0");
                          
                          if(isNaN(val) || val < 1) input.value = original.toString();
                          if(val > 500) input.value = "500";
                          
                          // Отправляем ТОЛЬКО если значение реально изменилось
                          if(parseInt(input.value) !== original) {
                            input.form?.submit();
                          }
                        }}
                      />
                    </div>
                  </form>

                  <form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={slot.id} />
                    <button type="submit" className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}