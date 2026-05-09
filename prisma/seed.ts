import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env["DATABASE_URL"] ?? "postgresql://postgres:1@sibsiu-postgres:5432/sibsiu_canteen?schema=public",
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categoriesData = [
  { name: "Наборы", slug: "sets" },
  { name: "Первые блюда", slug: "first-dishes" },
  { name: "Вторые блюда", slug: "second-dishes" },
  { name: "Салаты", slug: "salads" },
  { name: "Напитки", slug: "drinks" },
  { name: "Выпечка", slug: "baked" }
];

const products = [
  // ==================== НЕДЕЛЯ 1 (НЕЧЕТНАЯ) ====================
  
  // ----- НЕДЕЛЯ 1 - ПОНЕДЕЛЬНИК (day 1, week 1) -----
  { name: "Салат из св. капусты с зел.горошком", description: "Свежая капуста с зеленым горошком", price: 27, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Рубин", description: "", price: 20, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат с крабовыми палочками и огурцом", description: "", price: 47, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Кастилия", description: "", price: 62, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Грибная поляна", description: "", price: 57, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Легкий", description: "", price: 50, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 150 },
  { name: "Борщ с капустой, картофелем", description: "", price: 41, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 250 },
  { name: "Суп-лапша с помидорами по-казачьи", description: "", price: 53, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 250 },
  { name: "Каша молочная кукурузная", description: "", price: 30, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 200 },
  { name: "Горбуша припущенная", description: "", price: 98, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 120 },
  { name: "Рыба в яйце жареная (горбуша)", description: "", price: 116, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 120 },
  { name: "Жареный терпуг", description: "", price: 98, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 120 },
  { name: "Гуляш из говядины", description: "", price: 143, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 150 },
  { name: "Биточек особый", description: "", price: 80, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 100 },
  { name: "Сардельки отварные", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 100 },
  { name: "Куры жареные", description: "", price: 68, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 100 },
  { name: "Грудка с майонезом, сыром", description: "", price: 106, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 120 },
  { name: "Котлета куриная Мечта", description: "", price: 99, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 100 },
  { name: "Печень куриная с лучком", description: "", price: 56, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 100 },
  { name: "Картофельное пюре", description: "", price: 46, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 150 },
  { name: "Капуста тушеная", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 150 },
  { name: "Капуста брокколи на пару", description: "", price: 61, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 150 },
  { name: "Макароны отварные с сыром", description: "", price: 38, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 150 },
  { name: "Гречка рассыпчатая", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 150 },
  { name: "Напиток ягодный", description: "", price: 30, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 200 },
  { name: "Компот из сухофруктов", description: "", price: 16, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 1, weekType: 1, calories: 0, weight: 200 },

  // ----- НЕДЕЛЯ 1 - ВТОРНИК (day 2, week 1) -----
  { name: "Салат из св. капусты с зел.горошком", description: "Свежая капуста с зеленым горошком", price: 27, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Рубин", description: "", price: 20, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат с крабовыми палочками и огурцом", description: "", price: 47, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Грибная поляна", description: "", price: 57, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Легкий", description: "", price: 50, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Вираж", description: "", price: 74, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 150 },
  { name: "Борщ с капустой, картофелем", description: "", price: 41, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 250 },
  { name: "Суп-лапша с помидорами по-казачьи", description: "", price: 53, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 250 },
  { name: "Суп-пюре из брокколи с гренками", description: "", price: 92, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 250 },
  { name: "Каша молочная пшенная", description: "", price: 30, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 200 },
  { name: "Горбуша припущенная", description: "", price: 98, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 120 },
  { name: "Рыба в яйце жареная (горбуша)", description: "", price: 116, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 120 },
  { name: "Жареный терпуг", description: "", price: 98, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 120 },
  { name: "Мясо тушеное", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 120 },
  { name: "Плов со свининой", description: "", price: 87, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 200 },
  { name: "Биточек особый", description: "", price: 80, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 100 },
  { name: "Сардельки отварные", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 100 },
  { name: "Куры жареные", description: "", price: 68, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 100 },
  { name: "Грудка с майонезом, сыром", description: "", price: 106, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 120 },
  { name: "Котлета куриная Мечта", description: "", price: 99, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 100 },
  { name: "Картофельное пюре", description: "", price: 46, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 150 },
  { name: "Капуста тушеная", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 150 },
  { name: "Капуста брокколи на пару", description: "", price: 61, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 150 },
  { name: "Макароны отварные с сыром", description: "", price: 38, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 150 },
  { name: "Гречка рассыпчатая", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 150 },
  { name: "Напиток ягодный", description: "", price: 30, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 200 },
  { name: "Компот из сухофруктов", description: "", price: 16, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 2, weekType: 1, calories: 0, weight: 200 },

  // ----- НЕДЕЛЯ 1 - СРЕДА (day 3, week 1) -----
  { name: "Салат Свежесть", description: "", price: 27, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Аташе", description: "", price: 43, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Неженка", description: "", price: 30, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Елена", description: "", price: 49, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Астория", description: "", price: 69, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Обжорка", description: "", price: 55, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 150 },
  { name: "Рассольник Ленинградский", description: "", price: 53, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 250 },
  { name: "Суп грибной с гренками", description: "", price: 48, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 250 },
  { name: "Омлет натуральный", description: "", price: 55, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 150 },
  { name: "Каша молочная геркулес", description: "", price: 30, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 200 },
  { name: "Горбуша припущенная", description: "", price: 98, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 120 },
  { name: "Горбуша с ананасом", description: "", price: 149, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 120 },
  { name: "Минтай жареный", description: "", price: 67, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 120 },
  { name: "Биточек рыбный из горбуши", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 100 },
  { name: "Поджарка", description: "", price: 79, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 120 },
  { name: "Мясо Ужин лесника", description: "", price: 120, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 120 },
  { name: "Бефстроганов (печень)", description: "", price: 111, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 120 },
  { name: "Куры жареные", description: "", price: 68, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 100 },
  { name: "Грудка запеченная с помидорами", description: "", price: 107, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 120 },
  { name: "Биточек куриный паровой", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 100 },
  { name: "Картофельное пюре", description: "", price: 46, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 150 },
  { name: "Капуста тушеная", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 150 },
  { name: "Фасоль стручковая с овощами", description: "", price: 48, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 150 },
  { name: "Макароны отварные", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 150 },
  { name: "Рис Светофор", description: "", price: 35, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 150 },
  { name: "Напиток ягодный", description: "", price: 30, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 200 },
  { name: "Компот из сухофруктов", description: "", price: 16, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 3, weekType: 1, calories: 0, weight: 200 },

  // ----- НЕДЕЛЯ 1 - ЧЕТВЕРГ (day 4, week 1) -----
  { name: "Салат Свежесть", description: "", price: 27, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Аташе", description: "", price: 43, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Неженка", description: "", price: 30, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Елена", description: "", price: 49, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Астория", description: "", price: 69, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Обжорка", description: "", price: 55, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 150 },
  { name: "Порционно сыр", description: "", price: 20, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 50 },
  { name: "Масло сливочное", description: "", price: 20, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 20 },
  { name: "Яйцо отварное", description: "", price: 15, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 50 },
  { name: "Творог с сахаром и сметаной", description: "", price: 47, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 150 },
  { name: "Рассольник Ленинградский", description: "", price: 53, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 250 },
  { name: "Суп грибной с гренками", description: "", price: 48, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 250 },
  { name: "Каша молочная ячневая", description: "", price: 30, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 200 },
  { name: "Горбуша припущенная", description: "", price: 98, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 120 },
  { name: "Горбуша с ананасом", description: "", price: 149, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 120 },
  { name: "Минтай жареный", description: "", price: 67, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 120 },
  { name: "Биточек рыбный из горбуши", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 100 },
  { name: "Азу (говядина)", description: "", price: 127, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 120 },
  { name: "Мясо тушеное", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 120 },
  { name: "Мясо Ужин лесника", description: "", price: 120, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 120 },
  { name: "Куры жареные", description: "", price: 68, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 100 },
  { name: "Грудка запеченная с помидорами", description: "", price: 107, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 120 },
  { name: "Биточек куриный паровой", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 100 },
  { name: "Картофельное пюре", description: "", price: 46, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 150 },
  { name: "Капуста тушеная", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 150 },
  { name: "Фасоль стручковая с овощами", description: "", price: 48, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 150 },
  { name: "Макароны отварные", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 150 },
  { name: "Рис Светофор", description: "", price: 35, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 150 },
  { name: "Напиток ягодный", description: "", price: 30, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 200 },
  { name: "Компот из сухофруктов", description: "", price: 16, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 4, weekType: 1, calories: 0, weight: 200 },

  // ----- НЕДЕЛЯ 1 - ПЯТНИЦА (day 5, week 1) -----
  { name: "Салат Золотистый из капусты", description: "", price: 27, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Греческий", description: "", price: 75, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат из свеклы с изюмом, орехом", description: "", price: 35, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Мексиканка", description: "", price: 56, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат Ветчинный", description: "", price: 60, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 150 },
  { name: "Салат мясной", description: "", price: 41, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 150 },
  { name: "Рассольник Ленинградский", description: "", price: 53, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 250 },
  { name: "Щи из свежей капусты с картофелем", description: "", price: 40, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 250 },
  { name: "Суп сырный с гренками", description: "", price: 56, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 250 },
  { name: "Омлет натуральный", description: "", price: 55, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 150 },
  { name: "Каша молочная манная", description: "", price: 30, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 200 },
  { name: "Горбуша припущенная", description: "", price: 98, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 120 },
  { name: "Рыба по-ленинградски (горбуша)", description: "", price: 134, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 120 },
  { name: "Жареный терпуг", description: "", price: 98, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 120 },
  { name: "Гуляш из говядины", description: "", price: 142, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 150 },
  { name: "Котлета домашняя", description: "", price: 73, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 100 },
  { name: "Запеканка из печени", description: "", price: 87, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 100 },
  { name: "Куры жареные", description: "", price: 68, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 100 },
  { name: "Грудка куриная гриль", description: "", price: 114, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 120 },
  { name: "Шашлык куриный с соусом", description: "", price: 114, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 120 },
  { name: "Шницель куриный в панировке", description: "", price: 77, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 100 },
  { name: "Картофельное пюре", description: "", price: 46, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 150 },
  { name: "Капуста тушеная", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 150 },
  { name: "Капуста цветная на пару", description: "", price: 61, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 150 },
  { name: "Макароны отварные", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 150 },
  { name: "Перловка с грибами", description: "", price: 25, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 150 },
  { name: "Напиток ягодный", description: "", price: 30, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 200 },
  { name: "Компот из сухофруктов", description: "", price: 16, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 5, weekType: 1, calories: 0, weight: 200 },

  // ==================== НЕДЕЛЯ 2 (ЧЕТНАЯ) ====================

  // ----- НЕДЕЛЯ 2 - ПОНЕДЕЛЬНИК (day 1, week 2) -----
  { name: "Салат витаминный", description: "", price: 37, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 150 },
  { name: "Маринад овощной со свеклой", description: "", price: 30, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Южанка", description: "", price: 50, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Лагуна", description: "", price: 57, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Фаворит", description: "", price: 51, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Цезарь", description: "", price: 73, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 150 },
  { name: "Солянка домашняя", description: "", price: 61, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 250 },
  { name: "Суп-лапша с помидорами по-казачьи", description: "", price: 53, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 250 },
  { name: "Каша молочная кукурузная", description: "", price: 10, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 200 },
  { name: "Горбуша припущенная", description: "", price: 98, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 120 },
  { name: "Рыба в яйце жареная (горбуша)", description: "", price: 116, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 120 },
  { name: "Минтай жареный", description: "", price: 67, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 120 },
  { name: "Биточек рыбный из горбуши", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 100 },
  { name: "Поджарка Токань", description: "", price: 109, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 120 },
  { name: "Свинина с луком и грибами", description: "", price: 99, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 120 },
  { name: "Голубцы ленивые", description: "", price: 80, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 150 },
  { name: "Куры жареные", description: "", price: 68, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 100 },
  { name: "Грудка с майонезом, сыром", description: "", price: 106, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 120 },
  { name: "Котлета куриная Мечта", description: "", price: 99, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 100 },
  { name: "Печень куриная с лучком", description: "", price: 56, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 100 },
  { name: "Картофельное пюре", description: "", price: 46, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 150 },
  { name: "Капуста тушеная", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 150 },
  { name: "Капуста цветная на пару", description: "", price: 61, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 150 },
  { name: "Макароны отварные с сыром", description: "", price: 38, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 150 },
  { name: "Гречка с грибами", description: "", price: 28, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 150 },
  { name: "Напиток ягодный", description: "", price: 30, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 200 },
  { name: "Компот из сухофруктов", description: "", price: 16, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 1, weekType: 2, calories: 0, weight: 200 },

  // ----- НЕДЕЛЯ 2 - ВТОРНИК (day 2, week 2) -----
  { name: "Салат витаминный", description: "", price: 37, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 150 },
  { name: "Маринад овощной со свеклой", description: "", price: 30, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Южанка с яйцом под майонезом", description: "", price: 50, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Лагуна", description: "", price: 57, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Фаворит", description: "", price: 51, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Цезарь", description: "", price: 73, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 150 },
  { name: "Солянка домашняя", description: "", price: 61, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 250 },
  { name: "Суп-лапша с помидорами по-казачьи", description: "", price: 53, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 250 },
  { name: "Каша молочная ячневая", description: "", price: 30, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 200 },
  { name: "Горбуша припущенная", description: "", price: 98, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 120 },
  { name: "Рыба в яйце жареная (горбуша)", description: "", price: 116, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 120 },
  { name: "Минтай жареный", description: "", price: 67, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 120 },
  { name: "Биточек рыбный из горбуши", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 100 },
  { name: "Мясо тушеное", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 120 },
  { name: "Плов со свининой", description: "", price: 87, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 200 },
  { name: "Свинина с луком и грибами", description: "", price: 99, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 120 },
  { name: "Голубцы ленивые", description: "", price: 80, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 150 },
  { name: "Куры жареные", description: "", price: 68, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 100 },
  { name: "Грудка с майонезом, сыром", description: "", price: 106, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 120 },
  { name: "Котлета куриная Мечта", description: "", price: 99, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 100 },
  { name: "Картофельное пюре", description: "", price: 46, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 150 },
  { name: "Капуста тушеная", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 150 },
  { name: "Капуста цветная на пару", description: "", price: 61, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 150 },
  { name: "Макароны отварные с сыром", description: "", price: 38, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 150 },
  { name: "Гречка с грибами", description: "", price: 28, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 150 },
  { name: "Напиток ягодный", description: "", price: 30, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 200 },
  { name: "Компот из сухофруктов", description: "", price: 16, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 2, weekType: 2, calories: 0, weight: 200 },

  // ----- НЕДЕЛЯ 2 - СРЕДА (day 3, week 2) -----
  { name: "Салат Свежесть", description: "", price: 27, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Греческий", description: "", price: 75, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Красное море", description: "", price: 57, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Оливье", description: "", price: 46, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Легкий", description: "", price: 50, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Сказка", description: "", price: 68, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 150 },
  { name: "Щи из свежей капусты с картофелем", description: "", price: 43, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 250 },
  { name: "Суп картофельный с горохом и копченостями", description: "", price: 50, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 250 },
  { name: "Омлет натуральный", description: "", price: 55, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 150 },
  { name: "Каша молочная геркулес", description: "", price: 30, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 200 },
  { name: "Горбуша припущенная", description: "", price: 98, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 120 },
  { name: "Горбуша с овощами", description: "", price: 132, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 120 },
  { name: "Жареная камбала", description: "", price: 115, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 120 },
  { name: "Биточек рыбный из горбуши", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 100 },
  { name: "Гуляш из говядины", description: "", price: 142, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 150 },
  { name: "Свинина с помидором, сыром", description: "", price: 97, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 120 },
  { name: "Котлета полтавская", description: "", price: 79, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 100 },
  { name: "Печень отбивная", description: "", price: 102, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 100 },
  { name: "Куры жареные", description: "", price: 68, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 100 },
  { name: "Филе куриное Лесное", description: "", price: 112, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 120 },
  { name: "Биточек куриный паровой", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 100 },
  { name: "Картофельное пюре", description: "", price: 46, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 150 },
  { name: "Капуста тушеная", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 150 },
  { name: "Капуста брокколи на пару", description: "", price: 61, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 150 },
  { name: "Макароны отварные", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 150 },
  { name: "Булгур рассыпчатый", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 150 },
  { name: "Напиток ягодный", description: "", price: 30, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 200 },
  { name: "Компот из сухофруктов", description: "", price: 16, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 3, weekType: 2, calories: 0, weight: 200 },

  // ----- НЕДЕЛЯ 2 - ЧЕТВЕРГ (day 4, week 2) -----
  { name: "Салат Свежесть", description: "", price: 27, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Греческий", description: "", price: 75, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 150 },
  { name: "Сельдь под шубой", description: "", price: 51, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Оливье", description: "", price: 46, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Легкий", description: "", price: 50, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Сказка", description: "", price: 68, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 150 },
  { name: "Щи из свежей капусты с картофелем", description: "", price: 43, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 250 },
  { name: "Суп картофельный с горохом и копченостями", description: "", price: 50, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 250 },
  { name: "Каша молочная пшенная", description: "", price: 30, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 200 },
  { name: "Горбуша припущенная", description: "", price: 98, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 120 },
  { name: "Горбуша с овощами", description: "", price: 132, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 120 },
  { name: "Жареная камбала", description: "", price: 115, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 120 },
  { name: "Биточек рыбный из горбуши", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 100 },
  { name: "Гуляш из говядины", description: "", price: 142, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 150 },
  { name: "Азу (говядина)", description: "", price: 127, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 120 },
  { name: "Свинина с помидором, сыром", description: "", price: 97, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 120 },
  { name: "Котлета полтавская", description: "", price: 79, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 100 },
  { name: "Куры жареные", description: "", price: 68, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 100 },
  { name: "Филе куриное Лесное", description: "", price: 112, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 120 },
  { name: "Биточек куриный паровой", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 100 },
  { name: "Картофельное пюре", description: "", price: 46, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 150 },
  { name: "Капуста тушеная", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 150 },
  { name: "Капуста брокколи на пару", description: "", price: 61, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 150 },
  { name: "Макароны отварные", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 150 },
  { name: "Булгур рассыпчатый", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 150 },
  { name: "Напиток ягодный", description: "", price: 30, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 200 },
  { name: "Компот из сухофруктов", description: "", price: 16, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 4, weekType: 2, calories: 0, weight: 200 },

  // ----- НЕДЕЛЯ 2 - ПЯТНИЦА (day 5, week 2) -----
  { name: "Салат Золотистый из капусты", description: "", price: 27, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 150 },
  { name: "Спаржа по-корейски", description: "", price: 67, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 150 },
  { name: "Сельдь под шубой", description: "", price: 51, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Крабовый остренький", description: "", price: 60, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Колизей", description: "", price: 59, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 150 },
  { name: "Салат Королек", description: "", price: 58, categorySlug: "salads", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 150 },
  { name: "Борщ с капустой, картофелем", description: "", price: 41, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 250 },
  { name: "Суп сырный с гренками", description: "", price: 56, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 250 },
  { name: "Омлет натуральный", description: "", price: 55, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 150 },
  { name: "Каша молочная манная", description: "", price: 30, categorySlug: "first-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 200 },
  { name: "Горбуша припущенная", description: "", price: 98, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 120 },
  { name: "Рыба по-ленинградски (горбуша)", description: "", price: 134, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 120 },
  { name: "Минтай жареный", description: "", price: 67, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 120 },
  { name: "Биточек рыбный из горбуши", description: "", price: 81, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 100 },
  { name: "Свинина с французской горчицей", description: "", price: 92, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 120 },
  { name: "Котлета полтавская", description: "", price: 79, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 100 },
  { name: "Запеканка из печени", description: "", price: 87, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 100 },
  { name: "Куры жареные", description: "", price: 68, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 100 },
  { name: "Шашлык куриный с соусом", description: "", price: 114, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 120 },
  { name: "Грудка запеченная с помидорами", description: "", price: 107, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 120 },
  { name: "Котлета куриная Пожарская", description: "", price: 84, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 100 },
  { name: "Картофель Золотистый", description: "", price: 38, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 150 },
  { name: "Картофельное пюре", description: "", price: 46, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 150 },
  { name: "Капуста тушеная", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 150 },
  { name: "Макароны отварные", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 150 },
  { name: "Рис рассыпчатый", description: "", price: 30, categorySlug: "second-dishes", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 150 },
  { name: "Напиток ягодный", description: "", price: 30, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 200 },
  { name: "Компот из сухофруктов", description: "", price: 16, categorySlug: "drinks", image: "/bludo412.png", dayOfWeek: 5, weekType: 2, calories: 0, weight: 200 },
];

async function main() {
  console.log("Начало заполнения базы данных...");
  
  // Ждем пока база данных полностью будет готова принимать соединения
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`✅ Успешное подключение к базе данных с ${attempt} попытки`);
      break;
    } catch (e) {
      console.log(`⏳ Попытка подключения ${attempt}/10 не удалась, ждем 1 секунду...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // База данных новая после очистки томов - уже пустая
  // Очистка таблиц отключена чтобы избежать ошибки ECONNREFUSED
  // при первом запуске когда соединение только устанавливается
  
  // Создаем категории
  const categoryMap: Record<string, string> = {};
  
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: cat
    });
    categoryMap[cat.slug] = created.id;
    console.log(`Создана категория: ${cat.name}`);
  }
  
  // Создаем продукты
  for (const product of products) {
    const categoryId = categoryMap[product.categorySlug];
    if (!categoryId) {
      console.error(`Категория не найдена: ${product.categorySlug}`);
      continue;
    }
    
    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: categoryId,
        image: product.image,
        dayOfWeek: product.dayOfWeek,
        weekType: product.weekType,
        calories: product.calories,
        weight: product.weight,
        isAvailable: true,
        isVisible: true,
      }
    });
  }
  
  console.log(`Добавлено ${products.length} блюд в базу данных`);

  // Создаем стандартные временные слоты
  const timeSlots = [
    { label: "08:30", startTime: "08:30", capacity: 30 },
    { label: "09:00", startTime: "09:00", capacity: 30 },
    { label: "09:30", startTime: "09:30", capacity: 30 },
    { label: "10:00", startTime: "10:00", capacity: 40 },
    { label: "10:30", startTime: "10:30", capacity: 40 },
    { label: "11:00", startTime: "11:00", capacity: 40 },
    { label: "11:30", startTime: "11:30", capacity: 50 },
    { label: "12:00", startTime: "12:00", capacity: 60 },
    { label: "12:30", startTime: "12:30", capacity: 60 },
    { label: "13:00", startTime: "13:00", capacity: 50 },
    { label: "13:30", startTime: "13:30", capacity: 50 },
    { label: "14:00", startTime: "14:00", capacity: 40 },
    { label: "14:30", startTime: "14:30", capacity: 40 },
    { label: "15:00", startTime: "15:00", capacity: 30 },
    { label: "15:30", startTime: "15:30", capacity: 30 },
    { label: "16:00", startTime: "16:00", capacity: 30 },
  ];


  for (const slot of timeSlots) {
    await prisma.timeSlot.create({ data: slot });
    console.log(`Создан временной слот: ${slot.label} (${slot.startTime})`);
  }
  
  // Проверяем что категории созданы
  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();
  const slotCount = await prisma.timeSlot.count();
  console.log(`Всего блюд в базе: ${productCount}`);
  console.log(`Всего категорий в базе: ${categoryCount}`);
  console.log(`Всего временных слотов: ${slotCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
