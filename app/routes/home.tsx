import { useState, useEffect } from "react";
import { Clock, Flame, Wallet, Plus, Check } from "lucide-react";
import type { Route } from "./+types/home";
import { prisma } from "../lib/db.server";
import { useCart } from "../context/CartContext";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Столовая СибГИУ" },
    { name: "description", content: "Вкусная и качественная еда для студентов и сотрудников СибГИУ" },
  ];
}

// Только рабочие дни (понедельник-пятница)
const daysOfWeekNames = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];

// Получить текущий день двухнедельного цикла (только пн-пт)
function getCurrentCycleDay(): { dayOfWeek: number; weekType: number } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = воскресенье, 1 = понедельник, 5 = суббота
  
  // Если суббота или воскресенье - показываем последний рабочий день (пятница)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { dayOfWeek: 5, weekType: 1 };
  }
  
  // Получаем номер недели в году
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDays = (now.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
  
  // Двухнедельный цикл: нечетные недели = тип 1, четные = тип 2
  const weekType = weekNumber % 2 === 0 ? 2 : 1;
  
  // День недели: понедельник=1, пятница=5
  return { dayOfWeek, weekType };
}

// Loader для загрузки данных из базы
export async function loader() {
  // Получаем настройки меню (какая неделя опубликована)
  let settings = await prisma.menuSettings.findFirst();
  const publishedWeek = settings?.publishedWeek || 1;
  
  // Получаем текущий день цикла
  const currentCycleDay = getCurrentCycleDay();
  
  const products = await prisma.product.findMany({
    where: { 
      isAvailable: true,
      // Показываем только блюда из опубликованной недели
      weekType: publishedWeek,
      // Показываем только блюда на текущий день (только рабочие дни)
      dayOfWeek: currentCycleDay.dayOfWeek,
      // Показываем только видимые блюда (не скрытые админом на сегодня)
      isVisible: true,
    },
    orderBy: { name: "asc" },
  });
  
  // Преобразуем Decimal в number для сериализации
  const menuItems = products.map(p => ({
    ...p,
    price: Number(p.price),
  }));
  
  // Получаем случайное блюдо из меню на сегодня
  const todayDish = menuItems.length > 0 
    ? menuItems[Math.floor(Math.random() * menuItems.length)].name 
    : null;
  
  return { 
    menuItems, 
    publishedWeek, 
    currentCycleDay,
    dayName: daysOfWeekNames[currentCycleDay.dayOfWeek - 1],
    todayDish
  };
}

// Типы данных
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

const categories = ["Наборы", "Первые блюда", "Вторые блюда", "Салаты", "Напитки", "Выпечка"];

// Компонент карточки товара
function FoodCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    setIsAdded(true);
    onAdd(item);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-600">
          {item.category}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-sib-blue">{item.price}₽</span>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              isAdded
                ? "bg-green-500 text-white"
                : "bg-sib-blue hover:bg-blue-700 text-white"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-5 h-5" />
                Добавлено
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                В корзину
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const randomMenuItems = [
  "Плов по-студенчески",
  "Борщ сибирский",
  "Котлета с пюре",
  "Солянка мясная",
  "Гречка с гуляшом",
  "Омлет с сыром",
];

export default function Home({ loaderData }: Route.ComponentProps) {
  const { menuItems, dayName, todayDish } = loaderData;
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState("Наборы");

  // Получаем ID категории из URL параметров
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (category && categories.includes(category)) {
      setActiveCategory(category);
    }
    
    // Очистка URL от ошибок авторизации
    const error = params.get("error");
    if (error) {
      console.error("Auth error in URL:", error);
      // Очищаем URL от параметров ошибки
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const scrollToMenu = (category?: string) => {
    const menuSection = document.getElementById("menu");
    menuSection?.scrollIntoView({ behavior: "smooth" });
    if (category) {
      setActiveCategory(category);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  const filteredMenu = menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Вкусный обед —{" "}
              <span className="text-sib-blue">залог успешной учебы!</span>
            </h1>
            
            <div className="text-xl text-gray-600 mb-8">
              Сегодня: <span className="text-sib-orange font-bold">{dayName}</span>
              {todayDish && (
                <span> — в меню <span className="text-sib-blue font-bold">{todayDish}</span></span>
              )}
            </div>

            <button
              onClick={() => scrollToMenu()}
              className="bg-sib-blue hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 hover:shadow-lg hover:shadow-sib-blue/30 hover:-translate-y-1"
            >
              Выбрать обед
            </button>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop"
                alt="Вкусная еда в столовой"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Преимущества Section */}
      <section className="py-20 bg-gray-50 -mx-4 px-4 md:mx-0 md:px-0 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Наши <span className="text-sib-blue">преимущества</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 p-8 text-center group">
              <div className="w-16 h-16 bg-sib-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-sib-blue/20 transition-colors">
                <Clock className="w-8 h-8 text-sib-blue" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Экономия времени</h3>
              <p className="text-gray-600">Оформи заказ онлайн и забери его без очереди</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 p-8 text-center group">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors">
                <Flame className="w-8 h-8 text-sib-orange" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Всегда горячее</h3>
              <p className="text-gray-600">Мы начинаем готовить к вашему приходу</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 p-8 text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <Wallet className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Родные цены</h3>
              <p className="text-gray-600">Самые доступные комплексные обеды в университете</p>
            </div>
          </div>
        </div>
      </section>

      {/* Меню Section */}
      <section id="menu" className="py-20 bg-gray-50 -mx-4 px-4 md:mx-0 md:px-0 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Меню на <span className="text-sib-blue">{dayName}</span>
          </h2>
          
          {/* Табы категорий */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-sib-blue text-white shadow-lg shadow-sib-blue/30"
                    : "bg-white text-gray-600 hover:bg-gray-100 hover:text-sib-blue"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Сетка блюд */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map((item) => (
              <FoodCard key={item.id} item={item} onAdd={handleAddToCart} />
            ))}
          </div>
          
          {filteredMenu.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              На сегодня блюда не запланированы
            </div>
          )}
        </div>
      </section>

      {/* О нас Section */}
      <section id="about" className="py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            О <span className="text-sib-blue">нас</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Столовая СибГИУ предлагает широкий выбор блюд для студентов и сотрудников 
            Сибирского государственного индустриального университета. Мы заботимся о 
            качестве наших продуктов и готовим с любовью для каждого посетителя.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-sib-blue mb-2">10+</div>
              <div className="text-gray-600">лет опыта</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-sib-blue mb-2">1000+</div>
              <div className="text-gray-600">посетителей в день</div>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl font-bold text-sib-blue mb-2">50+</div>
              <div className="text-gray-600">блюд в меню</div>
            </div>
          </div>
        </div>
      </section>

      {/* Контакты Section */}
      <section id="contacts" className="py-20 bg-gray-50 -mx-4 px-4 md:mx-0 md:px-0 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            <span className="text-sib-blue">Контакты</span> и расписание
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Левая колонка - текст (2/5) */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Где мы находимся?</h3>
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-sib-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-sib-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Адрес</h4>
                        <p className="text-gray-600">г. Новокузнецк, пр. Бардина, 25</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-sib-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-sib-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Email</h4>
                        <a href="mailto:cafeteria@sibguti.ru" className="text-sib-blue hover:underline">
                          cafeteria@sibguti.ru
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Режим работы</h3>
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600">Понедельник - Пятница</span>
                      <span className="font-semibold text-sib-blue">08:00 - 16:00</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600">Суббота</span>
                      <span className="font-semibold text-sib-blue">09:00 - 14:00</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600">Воскресенье</span>
                      <span className="font-semibold text-gray-400">Выходной</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Правая колонка - карта (3/5) */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden h-full min-h-[400px]">
                <iframe
                  src="https://yandex.ru/map-widget/v1/?ll=87.2378%2C53.7607&z=16&pt=87.2378%2C53.7607%2Cpm2rdm"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen
                  className="w-full h-full min-h-[400px]"
                  title="Карта СибГИУ"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
