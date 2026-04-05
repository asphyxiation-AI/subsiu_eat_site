import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "1",
  database: "sibsiu_canteen",
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
  // Наборы (день 1-7, неделя 1)
  { name: "Комплексный обед №1", description: "Борщ, котлета с пюре, салат, компот", price: 250, categorySlug: "sets", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 1, calories: 850, weight: 450 },
  { name: "Комплексный обед №2", description: "Солянка, плов, овощи, чай", price: 280, categorySlug: "sets", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 1, calories: 920, weight: 480 },
  { name: "Студенческий набор", description: "Плов по-студенчески, салат, лепешка, компот", price: 220, categorySlug: "sets", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 1, calories: 780, weight: 420 },
  { name: "Эконом набор", description: "Гречка с гуляшем, салат витаминный, морс", price: 200, categorySlug: "sets", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 1, calories: 720, weight: 400 },
  
  // Первые блюда (день 1-7, неделя 1)
  { name: "Борщ сибирский", description: "Наваристый борщ со сметаной и зеленью", price: 120, categorySlug: "first-dishes", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 1, calories: 350, weight: 300 },
  { name: "Солянка мясная", description: "Насыщенная солянка с колбасой и оливками", price: 130, categorySlug: "first-dishes", image: "https://images.unsplash.com/photo-1582694099334-4a875a2537a2?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 1, calories: 380, weight: 280 },
  { name: "Суп куриный", description: "Легкий суп с курицей и лапшой", price: 100, categorySlug: "first-dishes", image: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 1, calories: 220, weight: 250 },
  { name: "Щи из свежей капусты", description: "Щи со сметаной и зеленью", price: 110, categorySlug: "first-dishes", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 1, calories: 280, weight: 280 },
  
  // Вторые блюда (день 1-7, неделя 1)
  { name: "Котлета с пюре", description: "Домашние котлеты с картофельным пюре", price: 150, categorySlug: "second-dishes", image: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 1, calories: 550, weight: 350 },
  { name: "Плов студенческий", description: "Ароматный плов с мясом и овощами", price: 140, categorySlug: "second-dishes", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 1, calories: 620, weight: 380 },
  { name: "Гречка с гуляшом", description: "Гречневая каша с подливой из говядины", price: 135, categorySlug: "second-dishes", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 1, calories: 580, weight: 360 },
  { name: "Рыба жареная с овощами", description: "Свежая рыба с овощным гарниром", price: 160, categorySlug: "second-dishes", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 1, calories: 480, weight: 320 },
  
  // Салаты (день 1-7, неделя 1)
  { name: "Салат Оливье", description: "Классический салат с колбасой и горошком", price: 80, categorySlug: "salads", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 1, calories: 250, weight: 200 },
  { name: "Салат Витаминный", description: "Свежие овощи с растительным маслом", price: 70, categorySlug: "salads", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 1, calories: 150, weight: 180 },
  { name: "Винегрет", description: "Овощной салат с растительным маслом", price: 65, categorySlug: "salads", image: "https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 1, calories: 180, weight: 200 },
  { name: "Свекольный салат", description: "Тертая свекла с чесноком и орехами", price: 75, categorySlug: "salads", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 1, calories: 160, weight: 180 },
  
  // Напитки (день 1-7, неделя 1)
  { name: "Компот ягодный", description: "Домашний компот из свежих ягод", price: 40, categorySlug: "drinks", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 1, calories: 80, weight: 200 },
  { name: "Чай черный", description: "Ароматный чай с сахаром", price: 25, categorySlug: "drinks", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 1, calories: 40, weight: 200 },
  { name: "Кисель яблочный", description: "Натуральный кисель без красителей", price: 45, categorySlug: "drinks", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 1, calories: 100, weight: 200 },
  { name: "Морс клюквенный", description: "Освежающий морс из клюквы", price: 50, categorySlug: "drinks", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 1, calories: 60, weight: 200 },
  
  // Выпечка (день 1-7, неделя 1)
  { name: "Пирожок с капустой", description: "Домашний пирожок с тушеной капустой", price: 35, categorySlug: "baked", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 1, calories: 220, weight: 100 },
  { name: "Булочка с корицей", description: "Сладкая булочка с корицей и сахаром", price: 40, categorySlug: "baked", image: "https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 1, calories: 280, weight: 90 },
  { name: "Сосиска в тесте", description: "Классическая сосиска в дрожжевом тесте", price: 45, categorySlug: "baked", image: "https://images.unsplash.com/photo-1600804939435-c63ba24262ed?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 1, calories: 320, weight: 110 },
  { name: "Ватрушка с творогом", description: "Вкусная ватрушка с творожной начинкой", price: 38, categorySlug: "baked", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 1, calories: 260, weight: 95 },

  // ПЯТНИЦА - Неделя 1 (день 5, неделя 1)
  { name: "Пятничный комплекс", description: "Уха, котлета по-киевски, оливье, морс", price: 290, categorySlug: "sets", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", dayOfWeek: 5, weekType: 1, calories: 890, weight: 500 },
  { name: "Уха рыбацкая", description: "Наваристая уха из нескольких видов рыбы", price: 140, categorySlug: "first-dishes", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop", dayOfWeek: 5, weekType: 1, calories: 320, weight: 300 },
  { name: "Котлета по-киевски", description: "Куриная котлета с сыром и маслом", price: 170, categorySlug: "second-dishes", image: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&h=300&fit=crop", dayOfWeek: 5, weekType: 1, calories: 620, weight: 350 },
  { name: "Салат Цезарь", description: "Салат с курицей, сыром и соусом", price: 90, categorySlug: "salads", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop", dayOfWeek: 5, weekType: 1, calories: 280, weight: 200 },
  { name: "Лимонад домашний", description: "Домашний лимонный лимонад", price: 45, categorySlug: "drinks", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", dayOfWeek: 5, weekType: 1, calories: 70, weight: 200 },
  { name: "Пирожок с картошкой", description: "Пирожок с картофелем и зеленью", price: 35, categorySlug: "baked", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop", dayOfWeek: 5, weekType: 1, calories: 240, weight: 100 },

  // НЕДЕЛЯ 2 (неделя 2) - Понедельник (день 1)
  { name: "Комплекс недели 2 №1", description: "Окрошка, тефтели, салат, компот", price: 260, categorySlug: "sets", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 2, calories: 870, weight: 460 },
  { name: "Окрошка мясная", description: "Холодный суп с говядиной и овощами", price: 115, categorySlug: "first-dishes", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 2, calories: 310, weight: 300 },
  { name: "Тефтели в томате", description: "Тефтели в томатном соусе с рисом", price: 145, categorySlug: "second-dishes", image: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 2, calories: 540, weight: 350 },
  { name: "Салат Классический", description: "Салат с огурцами и помидорами", price: 75, categorySlug: "salads", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 2, calories: 140, weight: 180 },
  { name: "Квас домашний", description: "Натуральный квас без добавок", price: 35, categorySlug: "drinks", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 2, calories: 50, weight: 200 },
  { name: "Пирожок с мясом", description: "Пирожок с фаршем", price: 40, categorySlug: "baked", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 2, calories: 280, weight: 100 },

  // НЕДЕЛЯ 2 - Вторник (день 2)
  { name: "Комплекс недели 2 №2", description: "Рассольник, гуляш, винегрет, чай", price: 270, categorySlug: "sets", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 2, calories: 900, weight: 470 },
  { name: "Рассольник", description: "Сытный рассольник с перловкой", price: 115, categorySlug: "first-dishes", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 2, calories: 340, weight: 300 },
  { name: "Стейк с овощами", description: "Стейк из свинины с овощами", price: 180, categorySlug: "second-dishes", image: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 2, calories: 680, weight: 380 },
  { name: "Салат Мимоза", description: "Салат с рыбой и яйцом", price: 85, categorySlug: "salads", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 2, calories: 260, weight: 200 },
  { name: "Чай с мёдом", description: "Чай с натуральным мёдом", price: 30, categorySlug: "drinks", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 2, calories: 45, weight: 200 },
  { name: "Булочка с маком", description: "Сладкая булочка с маком", price: 38, categorySlug: "baked", image: "https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 2, calories: 270, weight: 90 },

  // НЕДЕЛЯ 2 - Среда (день 3)
  { name: "Комплекс недели 2 №3", description: "Лапша домашняя, биточки, салат, кисель", price: 255, categorySlug: "sets", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 2, calories: 850, weight: 450 },
  { name: "Лапша домашняя", description: "Домашняя лапша с курицей", price: 105, categorySlug: "first-dishes", image: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 2, calories: 280, weight: 280 },
  { name: "Биточки паровые", description: "Паровые биточки из говядины", price: 140, categorySlug: "second-dishes", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 2, calories: 480, weight: 320 },
  { name: "Салат Греческий", description: "Салат с сыром и оливками", price: 95, categorySlug: "salads", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 2, calories: 220, weight: 200 },
  { name: "Кисель клубничный", description: "Натуральный клубничный кисель", price: 45, categorySlug: "drinks", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 2, calories: 90, weight: 200 },
  { name: "Пирожок с рисом", description: "Пирожок с рисом и яйцом", price: 38, categorySlug: "baked", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 2, calories: 250, weight: 100 },

  // НЕДЕЛЯ 2 - Четверг (день 4)
  { name: "Комплекс недели 2 №4", description: "Гороховый суп, пельмени, салат, морс", price: 265, categorySlug: "sets", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 2, calories: 920, weight: 480 },
  { name: "Гороховый суп", description: "Гороховый суп с копчёностями", price: 110, categorySlug: "first-dishes", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 2, calories: 360, weight: 300 },
  { name: "Пельмени сибирские", description: "Пельмени со сметаной", price: 150, categorySlug: "second-dishes", image: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 2, calories: 580, weight: 350 },
  { name: "Салат Айсберг", description: "Салат с кукурузой и горошком", price: 70, categorySlug: "salads", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 2, calories: 130, weight: 180 },
  { name: "Морс брусничный", description: "Натуральный брусничный морс", price: 50, categorySlug: "drinks", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 2, calories: 55, weight: 200 },
  { name: "Кекс шоколадный", description: "Вкусный шоколадный кекс", price: 45, categorySlug: "baked", image: "https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 2, calories: 320, weight: 100 },

  // НЕДЕЛЯ 2 - Пятница (день 5)
  { name: "Пятничный комплекс 2", description: "Солянка, бефстроганов, крабовый салат, лимонад", price: 295, categorySlug: "sets", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", dayOfWeek: 5, weekType: 2, calories: 950, weight: 520 },
  { name: "Солянка сборная", description: "Наваристая солянка с мясом", price: 135, categorySlug: "first-dishes", image: "https://images.unsplash.com/photo-1582694099334-4a875a2537a2?w=400&h=300&fit=crop", dayOfWeek: 5, weekType: 2, calories: 390, weight: 300 },
  { name: "Бефстроганов", description: "Говядина в сметанном соусе", price: 175, categorySlug: "second-dishes", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", dayOfWeek: 5, weekType: 2, calories: 640, weight: 360 },
  { name: "Салат Крабовый", description: "Салат с крабовыми палочками", price: 100, categorySlug: "salads", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop", dayOfWeek: 5, weekType: 2, calories: 270, weight: 200 },
  { name: "Лимонад клубничный", description: "Освежающий клубничный лимонад", price: 50, categorySlug: "drinks", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", dayOfWeek: 5, weekType: 2, calories: 75, weight: 200 },
  { name: "Пирожок с вишней", description: "Пирожок с вишней", price: 42, categorySlug: "baked", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop", dayOfWeek: 5, weekType: 2, calories: 290, weight: 100 },
];

async function main() {
  console.log("Начало заполнения базы данных...");
  
  // Очищаем существующие данные (удаляем в правильном порядке из-за связей)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  
  console.log("Старые данные удалены");
  
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
  
  // Проверяем что категории созданы
  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();
  console.log(`Всего блюд в базе: ${productCount}`);
  console.log(`Всего категорий в базе: ${categoryCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });