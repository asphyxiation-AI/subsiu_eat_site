import { Link } from "react-router";
import { Utensils, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-[#0066CC] via-[#0099FF] to-[#00AAFF] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Информация о столовой */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Столовая СибГИУ</span>
            </div>
            <p className="text-white/80 text-sm mb-4">
              Вкусная и здоровая еда для студентов и сотрудников университета. 
              Мы работаем с 08:00 до 16:00.
            </p>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <MapPin className="w-4 h-4" />
              <span>г. Новокузнецк, ул. Кирова, 7</span>
            </div>
          </div>

          {/* Категории меню */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-bold mb-4">Меню</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/#menu" className="text-white/80 hover:text-white transition-colors hover:underline">
                  Наборы
                </Link>
              </li>
              <li>
                <Link to="/#menu" className="text-white/80 hover:text-white transition-colors hover:underline">
                  Первые блюда
                </Link>
              </li>
              <li>
                <Link to="/#menu" className="text-white/80 hover:text-white transition-colors hover:underline">
                  Вторые блюда
                </Link>
              </li>
              <li>
                <Link to="/#menu" className="text-white/80 hover:text-white transition-colors hover:underline">
                  Салаты
                </Link>
              </li>
              <li>
                <Link to="/#menu" className="text-white/80 hover:text-white transition-colors hover:underline">
                  Напитки
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-bold mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/80">
                <Phone className="w-4 h-4" />
                <span>+7 (3843) 74-25-01</span>
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <Mail className="w-4 h-4" />
                <span>canteen@sibsiu.ru</span>
              </li>
              <li className="flex items-start gap-2 text-white/80">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>г. Новокузнецк, ул. Кирова, 7, корпус 1</span>
              </li>
            </ul>
          </div>

            {/* Социальные сети */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-bold mb-4">Мы в соцсетях</h3>
            <div className="flex gap-4">
              <a
                href="https://vk.com/sibsiu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all hover:scale-110 text-center font-bold"
              >
                VK
              </a>
              <a
                href="https://t.me/sibsiu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all hover:scale-110 text-center font-bold"
              >
                TG
              </a>
            </div>
            <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <p className="text-sm font-medium">Время работы:</p>
              <p className="text-white/80 text-sm">Пн-Пт: 08:00 - 16:00</p>
              <p className="text-white/60 text-xs mt-1">Сб-Вс: Выходной</p>
            </div>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="mt-12 pt-6 border-t border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm">
              © {currentYear} Столовая СибГИУ. Все права защищены.
            </p>
            <p className="text-white/60 text-sm">
              Разработано студентом СибГИУ с ❤️
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
