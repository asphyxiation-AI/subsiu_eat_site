import { useState, useEffect } from 'react';

interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
}

export default function TimeSlotPicker({ slots, selectedSlotId, onSelect }: TimeSlotPickerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Обновляем время каждую минуту чтобы скрывать слоты вовремя
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const filteredSlots = slots.filter(slot => {
    const [hours, minutes] = slot.startTime.split(':').map(Number);
    const slotStartTime = new Date();
    slotStartTime.setHours(hours, minutes, 0, 0);

    // Убираем слот если до начала осталось меньше 15 минут
    const timeUntilStart = slotStartTime.getTime() - currentTime.getTime();
    const fifteenMinutes = 15 * 60 * 1000;

    return timeUntilStart > fifteenMinutes;
  });

  if (filteredSlots.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-200">
        <div className="text-5xl mb-3">⏰</div>
        <p className="text-gray-600 text-lg font-medium">На сегодня все интервалы заняты</p>
        <p className="text-gray-500 text-sm mt-1">Пожалуйста, попробуйте завтра</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-lg font-semibold text-gray-800">
        Выберите время получения заказа
      </label>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredSlots.map(slot => {
          const fillPercent = (slot.booked / slot.capacity) * 100;
          const isAlmostFull = fillPercent >= 80;
          const isFull = fillPercent >= 100;
          const isSelected = selectedSlotId === slot.id;

          return (
            <button
              key={slot.id}
              type="button"
              disabled={isFull}
              onClick={() => !isFull && onSelect(slot.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all text-left
                ${isFull ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50' : ''}
                ${!isFull && !isSelected ? 'bg-white hover:bg-gray-50 hover:border-blue-300 cursor-pointer' : ''}
                ${!isFull && isAlmostFull && !isSelected ? 'border-amber-400 bg-amber-50' : ''}
                ${isSelected ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-offset-2' : ''}
              `}
            >
              <div className="font-bold text-gray-900">{slot.label}</div>
              <div className="text-sm text-gray-600 font-medium">
                {slot.startTime} — {slot.endTime}
              </div>

              <div className="mt-3">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${isFull ? 'bg-red-500' : isAlmostFull ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(fillPercent, 100)}%` }}
                  />
                </div>
                <div className="mt-1 text-xs font-medium">
                  {isFull
                    ? <span className="text-red-600">❌ Мест нет</span>
                    : <span className={isAlmostFull ? 'text-amber-600' : 'text-green-600'}>
                        ✔️ Осталось {slot.capacity - slot.booked} мест
                      </span>
                  }
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}