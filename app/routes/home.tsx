import { useState, useEffect, useRef } from "react";
import { Clock, Flame, Wallet, Plus, Check, Utensils, Sparkles, ChevronDown, Star, Users, Coffee } from "lucide-react";
import type { Route } from "./+types/home";
import { prisma } from "../lib/db.server";
import { useCart } from "../context/CartContext";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Столовая СибГИУ - Онлайн заказ" },
    { name: "description", content: "Вкусная и качественная еда для студентов и сотрудников СибГИУ. Заказывайте онлайн!" },
  ];
}

const daysOfWeekNames = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];

function getCurrentCycleDay(): { dayOfWeek: number; weekType: number } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { dayOfWeek: 5, weekType: 1 };
  }
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDays = (now.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
  const weekType = weekNumber % 2 === 0 ? 2 : 1;
  return { dayOfWeek, weekType };
}

export async function loader() {
  let settings = await prisma.menuSettings.findFirst();
  const publishedWeek = settings?.publishedWeek || 1;
  const currentCycleDay = getCurrentCycleDay();
  
  const products = await prisma.product.findMany({
    where: { 
      isAvailable: true,
      weekType: publishedWeek,
      dayOfWeek: currentCycleDay.dayOfWeek,
      isVisible: true,
    },
    orderBy: { name: "asc" },
  });
  
  const menuItems = products.map(p => ({
    ...p,
    price: Number(p.price),
  }));
  
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

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

const categories = ["Наборы", "Первые блюда", "Вторые блюда", "Салаты", "Напитки", "Выпечка"];

const categoryIcons: Record<string, React.ReactNode> = {
  "Наборы": <Utensils className="w-5 h-5" />,
  "Первые блюда": <Coffee className="w-5 h-5" />,
  "Вторые блюда": <Flame className="w-5 h-5" />,
  "Салаты": <Sparkles className="w-5 h-5" />,
  "Напитки": <Coffee className="w-5 h-5" />,
  "Выпечка": <Star className="w-5 h-5" />,
};

function FoodCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  const [isAdded, setIsAdded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleAdd = () => {
    setIsAdded(true);
    onAdd(item);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div 
      ref={cardRef}
      className="group relative bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/50"
    >
      {/* Градиентная полоса сверху */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-orange-400 to-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity" />
      
      {/* Изображение */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Категория badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-slate-700 shadow-lg">
          {categoryIcons[item.category]}
          {item.category}
        </div>

        {/* Цена badge */}
        <div className="absolute bottom-4 right-4 bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 rounded-2xl shadow-xl">
          <span className="text-white font-bold text-lg">{item.price}₽</span>
        </div>
      </div>

      {/* Контент */}
      <div className="p-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
          {item.name}
        </h3>
        <p className="text-slate-500 text-sm mb-5 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        
        {/* Кнопка */}
        <button
          onClick={handleAdd}
          className={`w-full relative overflow-hidden rounded-2xl font-bold py-3.5 px-6 transition-all duration-300 flex items-center justify-center gap-2 ${
            isAdded
              ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30"
              : "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5" />
              Добавлено в корзину
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
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { menuItems, dayName, todayDish } = loaderData;
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState("Наборы");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const scrollToMenu = () => {
    const menuSection = document.getElementById("menu");
    menuSection?.scrollIntoView({ behavior: "smooth" });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Фоновые элементы */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-400/30 to-fuchsia-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-400/30 to-blue-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-bl from-orange-400/20 to-amber-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Декоративные круги */}
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-violet-200/50 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-32 right-20 w-24 h-24 border-2 border-orange-200/50 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
        
        <div className="container mx-auto px-4 relative z-10 pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Текст */}
            <div className={`space-y-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-purple-100 px-5 py-2.5 rounded-full border border-violet-200/50">
                <Sparkles className="w-5 h-5 text-violet-600" />
                <span className="text-violet-700 font-semibold text-sm">Новый сервис онлайн-заказов!</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                  Вкусный обед —
                </span>
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  успешный день!
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                Заказывайте любимые блюда онлайн и забирайте без очереди. 
                Сегодня <span className="text-orange-500 font-bold">{dayName}</span>
                {todayDish && (
                  <span> — <span className="text-violet-600 font-semibold">{todayDish}</span></span>
                )}
              </p>

              {/* CTA кнопки */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={scrollToMenu}
                  className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Выбрать обед
                    <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button className="px-8 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  Как это работает?
                </button>
              </div>

              {/* Статистика */}
              <div className="flex gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">1000+</div>
                  <div className="text-sm text-slate-500">довольных студентов</div>
                </div>
                <div className="w-px bg-slate-200" />
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">5-10мин</div>
                  <div className="text-sm text-slate-500">среднее время ожидания</div>
                </div>
                <div className="w-px bg-slate-200" />
                <div className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">50+</div>
                  <div className="text-sm text-slate-500">блюд каждый день</div>
                </div>
              </div>
            </div>

            {/* Изображение */}
            <div className={`relative transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative">
                {/* Основное изображение */}
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-purple-500/20">
                  <img
                    src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop"
                    alt="Вкусная еда"
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Floating cards */}
                <div className="absolute -left-8 top-1/4 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Всегда горячее</div>
                      <div className="text-sm text-slate-500">Готовим к вашему приходу</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-1/4 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Без очереди</div>
                      <div className="text-sm text-slate-500">Экономьте время</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Карточка 1 */}
            <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Экономия времени</h3>
                <p className="text-slate-600 leading-relaxed">
                  Оформите заказ онлайн и заберите его в удобное время без стояния в очереди
                </p>
              </div>
            </div>

            {/* Карточка 2 */}
            <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
                  <Flame className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Всегда горячее</h3>
                <p className="text-slate-600 leading-relaxed">
                  Мы начинаем готовить ваш заказ заранее, чтобы к вашему приходу всё было свежим
                </p>
              </div>
            </div>

            {/* Карточка 3 */}
            <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Родные цены</h3>
                <p className="text-slate-600 leading-relaxed">
                  Самые доступные цены на комплексные обеды среди всех столовых университета
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-24 bg-gradient-to-b from-white via-slate-50 to-violet-50/50">
        <div className="container mx-auto px-4">
          {/* Заголовок */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-purple-100 px-5 py-2.5 rounded-full border border-violet-200/50 mb-6">
              <Utensils className="w-5 h-5 text-violet-600" />
              <span className="text-violet-700 font-semibold">Меню на сегодня</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Что будем есть
              </span>
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"> сегодня?</span>
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Выберите блюда из нашего разнообразного меню и оформите заказ онлайн
            </p>
          </div>

          {/* Категории */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`group relative px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-xl shadow-purple-500/30 -translate-y-0.5"
                    : "bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:shadow-lg hover:-translate-y-0.5 border border-slate-200/50"
                }`}
              >
                <span className={activeCategory === category ? "text-white" : `text-${['violet', 'orange', 'cyan', 'emerald', 'pink', 'amber'][index]}-600`}>
                  {categoryIcons[category]}
                </span>
                {category}
              </button>
            ))}
          </div>

          {/* Сетка блюд */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMenu.map((item) => (
              <FoodCard key={item.id} item={item} onAdd={handleAddToCart} />
            ))}
          </div>

          {filteredMenu.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Блюда не запланированы</h3>
              <p className="text-slate-500">Загляните завтра или выберите другую категорию</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border-4 border-white/30 rounded-full" />
          <div className="absolute bottom-20 right-20 w-96 h-96 border-4 border-white/20 rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-white">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                О нашей столовой
              </h2>
              <p className="text-xl text-white/90 leading-relaxed mb-8">
                Столовая СибГИУ предлагает широкий выбор блюд для студентов и сотрудников 
                Сибирского государственного индустриального университета. Мы заботимся о 
                качестве наших продуктов и готовим с любовью для каждого посетителя.
              </p>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-white/90">10+</div>
                  <div className="text-white/70 mt-1">лет опыта</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-white/90">1000+</div>
                  <div className="text-white/70 mt-1">в день</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-white/90">50+</div>
                  <div className="text-white/70 mt-1">блюд</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Присоединяйтесь!</div>
                    <div className="text-white/70">Более 1000 студентов уже заказывают</div>
                  </div>
                </div>
                <p className="text-white/80 leading-relaxed">
                  Оформите заказ прямо сейчас и оцените удобство онлайн-сервиса. 
                  Быстро, вкусно, без очередей!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contacts Section */}
      <section id="contacts" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Наши
              </span>
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent"> контакты</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Информация */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1">Адрес</h4>
                      <p className="text-slate-600">г. Новокузнецк, пр. Бардина, 42</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1">Email</h4>
                      <a href="mailto:aparceva_nv@sibsiu.ru" className="text-cyan-600 hover:underline">aparceva_nv@sibsiu.ru</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-8 text-white shadow-xl">
                <h4 className="font-bold text-xl mb-4">Режим работы</h4>
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-white/90">Понедельник - Пятница</span>
                    <span className="font-bold">08:00 - 16:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-white/90">Суббота</span>
                    <span className="font-bold">09:00 - 14:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-white/70">Воскресенье</span>
                    <span className="text-white/50">Выходной</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Карта */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-200/50 shadow-lg h-[400px]">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=87.128618%2C53.756404&z=16&pt=87.128353%2C53.756440%2Cpm2rdm"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                title="Карта СибГИУ"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
