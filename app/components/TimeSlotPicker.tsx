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
  onSelect: (slotId: string | null) => void;
}

export default function TimeSlotPicker({ slots, selectedSlotId, onSelect }: TimeSlotPickerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Обновляем время каждую минуту чтобы скрывать слоты вовремя
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const filteredSlots = slots.filter(slot => {
    // Блокируем заказы в субботу (6) и воскресенье (0)
    const dayOfWeek = currentTime.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false;
    }

    const [hours, minutes] = slot.startTime.split(':').map(Number);
    const slotStartTime = new Date();
    slotStartTime.setHours(hours, minutes, 0, 0);

    // Убираем слот если до начала осталось меньше 15 минут
    const timeUntilStart = slotStartTime.getTime() - currentTime.getTime();
    const fifteenMinutes = 15 * 60 * 1000;

    return timeUntilStart > fifteenMinutes;
  });

  const handleSelect = (slotId: string) => {
    if (selectedSlotId === slotId) {
      onSelect(null);
    } else {
      onSelect(slotId);
    }
  };

  if (filteredSlots.length === 0) {
    const dayOfWeek = currentTime.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return (
      <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-200">
        <div className="text-5xl mb-3">⏰</div>
        {isWeekend ? (
          <>
            <p className="text-gray-600 text-lg font-medium">В выходные заказы не принимаются</p>
            <p className="text-gray-500 text-sm mt-1">Пожалуйста, попробуйте в будний день</p>
          </>
        ) : (
          <>
            <p className="text-gray-600 text-lg font-medium">На сегодня все интервалы заняты</p>
            <p className="text-gray-500 text-sm mt-1">Пожалуйста, попробуйте завтра</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-lg font-semibold text-gray-800">
        Выберите время получения заказа
      </label>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2 max-h-[320px] overflow-y-auto pr-1 py-1">
        {filteredSlots.map(slot => {
          const fillPercent = (slot.booked / slot.capacity) * 100;
          const isAlmostFull = fillPercent >= 80;
          const isFull = fillPercent >= 100;
          const isSelected = selectedSlotId === slot.id;
          const available = slot.capacity - slot.booked;
          const displayCount = available > 99 ? '99+' : available;

          return (
            <button
              key={slot.id}
              type="button"
              disabled={isFull}
              onClick={() => !isFull && handleSelect(slot.id)}
            className={`
                relative px-2 py-2 rounded-md border-2 transition-all flex items-center justify-between gap-2
                ${isFull ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50' : ''}
                ${!isFull && !isSelected ? 'bg-white hover:bg-gray-50 hover:border-blue-300 cursor-pointer' : ''}
                ${!isFull && isAlmostFull && !isSelected ? 'border-amber-400 bg-amber-50' : ''}
                ${isSelected ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600' : ''}
              `}
            >
              <div className="font-bold text-sm text-gray-900">{slot.label}</div>
              <div className={`text-xs font-medium flex items-center justify-center ${isFull ? 'text-red-600' : isAlmostFull ? 'text-amber-600' : 'text-green-600'}`}>
                {isFull ? (
                  <span>❌</span>
                ) : (
                  <>
                    ✔️<span className="ml-0.5 font-semibold whitespace-nowrap">{displayCount}</span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}