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

const categories = [
  "Наборы",
  "Первые блюда", 
  "Вторые блюда",
  "Салаты",
  "Напитки",
  "Выпечка"
];

const products = [
  // Наборы (день 1-7, неделя 1)
  { name: "Комплексный обед №1", description: "Борщ, котлета с пюре, салат, компот", price: 250, category: "Наборы", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 1 },
  { name: "Комплексный обед №2", description: "Солянка, плов, овощи, чай", price: 280, category: "Наборы", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 1 },
  { name: "Студенческий набор", description: "Плов по-студенчески, салат, лепешка, компот", price: 220, category: "Наборы", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 1 },
  { name: "Эконом набор", description: "Гречка с гуляшем, салат витаминный, морс", price: 200, category: "Наборы", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 1 },
  
  // Первые блюда (день 1-7, неделя 1)
  { name: "Борщ сибирский", description: "Наваристый борщ со сметаной и зеленью", price: 120, category: "Первые блюда", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 1 },
  { name: "Солянка мясная", description: "Насыщенная солянка с колбасой и оливками", price: 130, category: "Первые блюда", image: "https://images.unsplash.com/photo-1582694099334-4a875a2537a2?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 1 },
  { name: "Суп куриный", description: "Легкий суп с курицей и лапшой", price: 100, category: "Первые блюда", image: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 1 },
  { name: "Щи из свежей капусты", description: "Щи со сметаной и зеленью", price: 110, category: "Первые блюда", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 1 },
  
  // Вторые блюда (день 1-7, неделя 1)
  { name: "Котлета с пюре", description: "Домашние котлеты с картофельным пюре", price: 150, category: "Вторые блюда", image: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 1 },
  { name: "Плов студенческий", description: "Ароматный плов с мясом и овощами", price: 140, category: "Вторые блюда", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 1 },
  { name: "Гречка с гуляшом", description: "Гречневая каша с подливой из говядины", price: 135, category: "Вторые блюда", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 1 },
  { name: "Рыба жареная с овощами", description: "Свежая рыба с овощным гарниром", price: 160, category: "Вторые блюда", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 1 },
  
  // Салаты (день 1-7, неделя 1)
  { name: "Салат Оливье", description: "Классический салат с колбасой и горошком", price: 80, category: "Салаты", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 1 },
  { name: "Салат Витаминный", description: "Свежие овощи с растительным маслом", price: 70, category: "Салаты", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 1 },
  { name: "Винегрет", description: "Овощной салат с растительным маслом", price: 65, category: "Салаты", image: "https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 1 },
  { name: "Свекольный салат", description: "Тертая свекла с чесноком и орехами", price: 75, category: "Салаты", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 1 },
  
  // Напитки (день 1-7, неделя 1)
  { name: "Компот ягодный", description: "Домашний компот из свежих ягод", price: 40, category: "Напитки", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 1 },
  { name: "Чай черный", description: "Ароматный чай с сахаром", price: 25, category: "Напитки", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 1 },
  { name: "Кисель яблочный", description: "Натуральный кисель без красителей", price: 45, category: "Напитки", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 1 },
  { name: "Морс клюквенный", description: "Освежающий морс из клюквы", price: 50, category: "Напитки", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 1 },
  
  // Выпечка (день 1-7, неделя 1)
  { name: "Пирожок с капустой", description: "Домашний пирожок с тушеной капустой", price: 35, category: "Выпечка", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop", dayOfWeek: 1, weekType: 1 },
  { name: "Булочка с корицей", description: "Сладкая булочка с корицей и сахаром", price: 40, category: "Выпечка", image: "https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=300&fit=crop", dayOfWeek: 2, weekType: 1 },
  { name: "Сосиска в тесте", description: "Классическая сосиска в дрожжевом тесте", price: 45, category: "Выпечка", image: "https://images.unsplash.com/photo-1600804939435-c63ba24262ed?w=400&h=300&fit=crop", dayOfWeek: 3, weekType: 1 },
  { name: "Ватрушка с творогом", description: "Вкусная ватрушка с творожной начинкой", price: 38, category: "Выпечка", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop", dayOfWeek: 4, weekType: 1 },
];

async function main() {
  console.log("Начало заполнения базы данных...");
  
  // Очищаем существующие данные
  await prisma.product.deleteMany();
  
  console.log("Старые данные удалены");
  
  // Добавляем продукты
  for (const product of products) {
    await prisma.product.create({
      data: product
    });
  }
  
  console.log(`Добавлено ${products.length} блюд в базу данных`);
  
  // Проверяем что категории созданы
  const productCount = await prisma.product.count();
  console.log(`Всего блюд в базе: ${productCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
