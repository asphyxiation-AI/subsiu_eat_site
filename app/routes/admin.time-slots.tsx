import { useLoaderData, useFormAction, useNavigation } from "react-router";
import { useState } from "react";
import { z } from "zod";
import { Clock, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const TimeSlotSchema = z.object({
  label: z.string().min(2, "Название минимум 2 символа"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Формат HH:mm"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Формат HH:mm"),
  capacity: z.coerce.number().int().min(1, "Минимум 1 место"),
});

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
    const data = TimeSlotSchema.parse(Object.fromEntries(formData));
    await prisma.timeSlot.create({ data });
    return { ok: true };
  }

  if (intent === "toggle") {
    const id = formData.get("id") as string;
    const slot = await prisma.timeSlot.findUnique({ where: { id } });
    await prisma.timeSlot.update({
      where: { id },
      data: { isEnabled: !slot.isEnabled }
    });
    return { ok: true };
  }

  if (intent === "delete") {
    const id = formData.get("id") as string;
    await prisma.timeSlot.delete({ where: { id } });
    return { ok: true };
  }

  if (intent === "updateCapacity") {
    const id = formData.get("id") as string;
    const capacity = parseInt(formData.get("capacity") as string);
    await prisma.timeSlot.update({
      where: { id },
      data: { capacity }
    });
    return { ok: true };
  }

  return { ok: false };
}

export default function AdminTimeSlots() {
  const { slots } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [showForm, setShowForm] = useState(false);

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Временные интервалы</h1>
          <p className="text-gray-600 mt-1">Управление слотами для выдачи заказов</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Добавить слот
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Новый временной интервал</h3>
          <form method="post" className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="hidden" name="intent" value="create" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
              <input name="label" placeholder="Завтрак" className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Начало</label>
              <input name="startTime" type="time" className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Конец</label>
              <input name="endTime" type="time" className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Макс. заказов</label>
              <input name="capacity" type="number" min="1" defaultValue="50" className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
            </div>
            <div className="md:col-span-4">
              <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
                Создать
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.map((slot) => {
          const ordersCount = slot._count.orders;
          const fillPercent = Math.round((ordersCount / slot.capacity) * 100);
          const isAlmostFull = fillPercent >= 80;
          const isFull = fillPercent >= 100;

          return (
            <div key={slot.id} className={`bg-white rounded-2xl shadow-lg border-2 transition-all ${slot.isEnabled ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{slot.label}</h3>
                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                      <Clock className="w-4 h-4" />
                      {slot.startTime} — {slot.endTime}
                    </div>
                  </div>

                  <form method="post">
                    <input type="hidden" name="intent" value="toggle" />
                    <input type="hidden" name="id" value={slot.id} />
                    <button type="submit" className="text-gray-400 hover:text-gray-600">
                      {slot.isEnabled
                        ? <ToggleRight className="w-10 h-10 text-green-500" />
                        : <ToggleLeft className="w-10 h-10 text-gray-400" />
                      }
                    </button>
                  </form>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Загруженность на сегодня</span>
                    <span className={`font-bold ${isFull ? 'text-red-600' : isAlmostFull ? 'text-amber-600' : 'text-green-600'}`}>
                      {ordersCount} / {slot.capacity}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${isFull ? 'bg-red-500' : isAlmostFull ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(fillPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <form method="post" className="flex-1">
                    <input type="hidden" name="intent" value="updateCapacity" />
                    <input type="hidden" name="id" value={slot.id} />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Лимит:</span>
                      <input
                        name="capacity"
                        type="number"
                        min="1"
                        defaultValue={slot.capacity}
                        className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-center"
                        onBlur={(e) => e.target.form.submit()}
                      />
                    </div>
                  </form>

                  <form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={slot.id} />
                    <button type="submit" className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-5 h-5" />
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