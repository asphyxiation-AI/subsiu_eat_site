import { useState } from "react";
import { Link, useFetcher } from "react-router";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Image as ImageIcon, 
  ArrowLeft,
  Save,
  X,
  Upload,
  EyeOff,
  Eye,
  Calendar,
  CheckCircle,
  Circle,
  Filter
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { prisma } from "../lib/db.server";
import { getCurrentCycleDay } from "../lib/timezone";
import type { Route } from "./+types/admin.menu";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Управление меню - Админ-панель | Столовая СибГИУ" },
    { name: "description", content: "Управление меню столовой" },
  ];
}

// Типы данных - с optional description для совместимости с маппингом
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  isVisible: boolean;
  dayOfWeek: number;
  weekType: number;
}

interface MenuSettings {
  id: string;
  publishedWeek: number;
}

const categories = ["Наборы", "Первые блюда", "Вторые блюда", "Салаты", "Напитки", "Выпечка"];
const weekTypes = [
  { value: 1, label: "Неделя 1" },
  { value: 2, label: "Неделя 2" },
];

const daysOfWeek = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];

async function requireAdminRole(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const cookies: Record<string, string> = {};
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.trim().split("=");
      if (parts.length >= 2) cookies[parts[0]] = parts.slice(1).join("=");
    });
  }
  const accessToken = cookies["access_token"];
  if (!accessToken) throw new Response("Unauthorized", { status: 401 });
  const payload = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64").toString("utf-8"));
  const roles = payload.realm_access?.roles || [];
  if (!roles.includes("admin")) throw new Response("Forbidden", { status: 403 });
  return true;
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdminRole(request);
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  });
  const menuItems = products.map(p => ({
    ...p,
    category: p.category?.name || "Наборы",
    price: Number(p.price),
  }));
  let settings = await prisma.menuSettings.findFirst();
  if (!settings) settings = await prisma.menuSettings.create({ data: { publishedWeek: 1 } });
  return { menuItems, settings, currentCycleDay: getCurrentCycleDay() };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminRole(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  try {
    if (intent === "publish") {
      const weekType = parseInt(formData.get("weekType") as string);
      let settings = await prisma.menuSettings.findFirst();
      if (settings) await prisma.menuSettings.update({ where: { id: settings.id }, data: { publishedWeek: weekType } });
      else await prisma.menuSettings.create({ data: { publishedWeek: weekType } });
      return { success: true, message: `Опубликована неделя ${weekType}` };
    }
    if (intent === "toggleVisibility") {
      const id = formData.get("id") as string;
      const product = await prisma.product.findUnique({ where: { id } });
      if (product) await prisma.product.update({ where: { id }, data: { isVisible: !product.isVisible } });
      return { success: true, message: product?.isVisible ? "Блюдо скрыто" : "Блюдо видно" };
    }
    if (intent === "toggleVisibilityAll") {
      const filterDay = formData.get("filterDay") ? parseInt(formData.get("filterDay") as string) : null;
      const filterWeek = formData.get("filterWeek") ? parseInt(formData.get("filterWeek") as string) : null;
      
      const where: any = {};
      if (filterDay !== null) where.dayOfWeek = filterDay;
      if (filterWeek !== null) where.weekType = filterWeek;
      
      const products = await prisma.product.findMany({ where, select: { id: true, isVisible: true } });
      const allVisible = products.every(p => p.isVisible);
      
      await prisma.product.updateMany({ where, data: { isVisible: !allVisible } });
      
      return { success: true, message: `Обновлено ${products.length} блюд` };
    }
    if (intent === "delete") {
      await prisma.product.delete({ where: { id: formData.get("id") as string } });
      return { success: true, message: "Блюдо удалено" };
    }
    if (intent === "deleteAll") {
      const filterDay = formData.get("filterDay") ? parseInt(formData.get("filterDay") as string) : null;
      const filterWeek = formData.get("filterWeek") ? parseInt(formData.get("filterWeek") as string) : null;
      
      const where: any = {};
      if (filterDay !== null) where.dayOfWeek = filterDay;
      if (filterWeek !== null) where.weekType = filterWeek;
      
      const count = await prisma.product.count({ where });
      await prisma.product.deleteMany({ where });
      
      return { success: true, message: `Удалено ${count} блюд` };
    }
    if (intent === "create" || intent === "update") {
      const id = formData.get("id") as string | undefined;
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const price = parseFloat(formData.get("price") as string);
      const categoryName = formData.get("category") as string;
      const image = formData.get("image") as string;
      const isAvailable = formData.get("isAvailable") === "true";
      const isVisible = formData.get("isVisible") === "true";
      const dayOfWeek = parseInt(formData.get("dayOfWeek") as string);
      const weekType = parseInt(formData.get("weekType") as string);
      const category = await prisma.category.findFirst({ where: { name: categoryName } });
      if (!category) return { success: false, message: "Категория не найдена" };
       const finalImage = image || "/bludo412.png";
      if (intent === "create") {
        await prisma.product.create({ data: { name, description, price, categoryId: category.id, image: finalImage, isAvailable, isVisible, dayOfWeek, weekType } });
        return { success: true, message: "Блюдо добавлено" };
      } else {
        await prisma.product.update({ where: { id }, data: { name, description, price, categoryId: category.id, image: finalImage, isAvailable, isVisible, dayOfWeek, weekType } });
        return { success: true, message: "Блюдо обновлено" };
      }
    }
    return { success: false, message: "Неизвестное действие" };
  } catch (error) {
    console.error("Action error:", error);
    return { success: false, message: "Ошибка при выполнении операции" };
  }
}

export default function AdminMenu({ loaderData }: Route.ComponentProps) {
  const { menuItems, settings, currentCycleDay } = loaderData;
  const { isAuthenticated, hasRole, user } = useAuth();
  const fetcher = useFetcher();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [filterDay, setFilterDay] = useState<number | null>(null);
  const [filterWeek, setFilterWeek] = useState<number | null>(null);
  const isAdmin = hasRole("admin");

  if (!isAuthenticated) return <div className="container mx-auto px-4 py-16"><div className="max-w-md mx-auto text-center"><h1 className="text-2xl font-bold text-gray-900 mb-4">Требуется авторизация</h1><Link to="/profile" className="text-sib-blue hover:underline">Войти в систему</Link></div></div>;
  if (!isAdmin) return <div className="container mx-auto px-4 py-8"><div className="mb-8"><Link to="/" className="flex items-center gap-2 text-sib-blue hover:underline"><ArrowLeft className="w-4 h-4" />На главную</Link></div><div className="bg-red-50 border border-red-200 rounded-2xl p-6"><h1 className="text-2xl font-bold text-red-900 mb-2">Доступ запрещён</h1><p className="text-red-700">У вас нет прав администратора</p></div></div>;

  const filteredProducts = menuItems.filter((p: Product) => (filterDay === null || p.dayOfWeek === filterDay) && (filterWeek === null || p.weekType === filterWeek));
  const groupedProducts = categories.reduce((acc, category) => { acc[category] = filteredProducts.filter((p: Product) => p.category === category); return acc; }, {} as Record<string, Product[]>);

  const handleEdit = (product: Product) => { setEditingProduct(product); setImagePreview(product.image || ""); setShowForm(true); };
  const handleDelete = (id: string) => { if (confirm("Удалить это блюдо?")) fetcher.submit({ intent: "delete", id }, { method: "post" }); };
  const handleToggleVisibility = (id: string) => fetcher.submit({ intent: "toggleVisibility", id }, { method: "post" });
  const handlePublish = (weekType: number) => fetcher.submit({ intent: "publish", weekType: weekType.toString() }, { method: "post" });
  
  const handleToggleAll = () => {
    const formData = new FormData();
    formData.append("intent", "toggleVisibilityAll");
    if (filterDay !== null) formData.append("filterDay", filterDay.toString());
    if (filterWeek !== null) formData.append("filterWeek", filterWeek.toString());
    fetcher.submit(formData, { method: "post" });
  };
  
  const handleDeleteAll = () => {
    if (confirm(`Удалить ВСЕ ${filteredProducts.length} отфильтрованных блюд? Это действие нельзя отменить!`)) {
      const formData = new FormData();
      formData.append("intent", "deleteAll");
      if (filterDay !== null) formData.append("filterDay", filterDay.toString());
      if (filterWeek !== null) formData.append("filterWeek", filterWeek.toString());
      fetcher.submit(formData, { method: "post" });
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { if (file.size > 2 * 1024 * 1024) { alert("Файл слишком большой"); return; } const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result as string); reader.readAsDataURL(file); } };
  const handleCloseForm = () => { setShowForm(false); setEditingProduct(null); setImagePreview(""); };
  const clearFilters = () => { setFilterDay(null); setFilterWeek(null); };
  const getCountForDay = (day: number) => menuItems.filter((p: Product) => p.dayOfWeek === day).length;
  const getCountForWeek = (week: number) => menuItems.filter((p: Product) => p.weekType === week).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-sib-blue to-blue-600 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-white/20 hover:bg-white/30 rounded-xl"><ArrowLeft className="w-6 h-6" /></Link>
            <div><h1 className="text-3xl font-bold">Управление меню</h1><p className="text-blue-100">Администратор: {user?.fullName || user?.username}</p></div>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2"><div className="flex items-center gap-2"><Calendar className="w-5 h-5" /><span className="font-medium">Сегодня: {daysOfWeek[currentCycleDay.dayOfWeek - 1]} (Неделя {currentCycleDay.weekType})</span></div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><CheckCircle className="w-6 h-6 text-green-600" />Публикация меню</h2>
        <p className="text-gray-600 mb-4">Выберите неделю меню:</p>
        <div className="flex items-center gap-4">
          {weekTypes.map((wt) => (<button key={wt.value} onClick={() => handlePublish(wt.value)} disabled={fetcher.state !== "idle"} className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold ${settings.publishedWeek === wt.value ? "bg-green-100 text-green-800 border-2 border-green-500" : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"}`}>{settings.publishedWeek === wt.value ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-gray-400" />}{wt.label}{settings.publishedWeek === wt.value && <span className="text-sm text-green-600">(опубликовано)</span>}</button>))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <div className="flex items-center gap-2 mb-4"><Filter className="w-5 h-5 text-gray-600" /><h2 className="text-xl font-bold text-gray-900">Фильтры</h2>{(filterDay !== null || filterWeek !== null) && <button onClick={clearFilters} className="ml-auto text-sm text-sib-blue hover:underline">Сбросить</button>}</div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">День недели:</label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterDay(null)} className={`px-4 py-2 rounded-xl font-medium ${filterDay === null ? "bg-sib-blue text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Все дни ({menuItems.length})</button>
            {daysOfWeek.map((day, idx) => (<button key={idx + 1} onClick={() => setFilterDay(idx + 1)} className={`px-4 py-2 rounded-xl font-medium ${filterDay === idx + 1 ? "bg-sib-blue text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{day} ({getCountForDay(idx + 1)})</button>))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Неделя в цикле:</label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterWeek(null)} className={`px-4 py-2 rounded-xl font-medium ${filterWeek === null ? "bg-sib-blue text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Все недели</button>
            {weekTypes.map((wt) => (<button key={wt.value} onClick={() => setFilterWeek(wt.value)} className={`px-4 py-2 rounded-xl font-medium ${filterWeek === wt.value ? "bg-sib-blue text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{wt.label} ({getCountForWeek(wt.value)})</button>))}
          </div>
         </div>

       </div>

       <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-3">
           <button 
             onClick={handleToggleAll} 
             disabled={filteredProducts.length === 0 || fetcher.state !== "idle"}
             className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Eye className="w-4 h-4" />
             Переключить ({filteredProducts.length})
           </button>
           <button 
             onClick={handleDeleteAll} 
             disabled={filteredProducts.length === 0 || fetcher.state !== "idle"}
             className="flex items-center gap-2 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Trash2 className="w-4 h-4" />
             Удалить все ({filteredProducts.length})
           </button>
        </div>
        <button onClick={() => { setEditingProduct(null); setImagePreview(""); setShowForm(true); }} className="flex items-center gap-2 bg-sib-blue hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl"><Plus className="w-5 h-5" />Добавить блюдо</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-gray-900">{editingProduct ? "Редактирование" : "Добавление"} блюда</h2><button onClick={handleCloseForm} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-6 h-6 text-gray-600" /></button></div>
              <fetcher.Form method="post" onSubmit={() => setTimeout(handleCloseForm, 100)}>
                <input type="hidden" name="intent" value={editingProduct ? "update" : "create"} />
                {editingProduct && <input type="hidden" name="id" value={editingProduct.id} />}
                <input type="hidden" name="image" value={imagePreview} />
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Название *</label><input type="text" name="name" required defaultValue={editingProduct?.name || ""} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sib-blue" placeholder="Например: Борщ сибирский" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Описание</label><textarea name="description" rows={3} defaultValue={editingProduct?.description || ""} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sib-blue" placeholder="Опишите блюдо..." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Цена (₽) *</label><input type="number" name="price" required min="0" step="1" defaultValue={editingProduct?.price || ""} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sib-blue" placeholder="150" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Категория *</label><select name="category" required defaultValue={editingProduct?.category || "Наборы"} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sib-blue">{categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">День недели</label><select name="dayOfWeek" required defaultValue={editingProduct?.dayOfWeek || 1} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sib-blue">{daysOfWeek.map((day, idx) => (<option key={idx + 1} value={idx + 1}>{day}</option>))}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Неделя в цикле</label><select name="weekType" required defaultValue={editingProduct?.weekType || 1} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sib-blue">{weekTypes.map(wt => (<option key={wt.value} value={wt.value}>{wt.label}</option>))}</select></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Изображение</label><div className="flex items-center gap-4"><label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50"><Upload className="w-5 h-5 text-gray-600" /><span className="text-gray-600">Выбрать файл</span><input type="file" accept="image/*" onChange={handleImageChange} className="hidden" /></label>{imagePreview && (<div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200"><img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /><button type="button" onClick={() => setImagePreview("")} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X className="w-3 h-3" /></button></div>)}</div></div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="isAvailable" value="true" defaultChecked={editingProduct?.isAvailable !== false} className="w-5 h-5 text-[#0066CC] rounded" /><span className="text-sm font-medium text-gray-700">Доступно для заказа</span></label>
                    <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="isVisible" value="true" defaultChecked={editingProduct?.isVisible !== false} className="w-5 h-5 text-[#FF8C00] rounded" /><span className="text-sm font-medium text-gray-700">Скрыть на сегодня</span></label>
                  </div>
                </div>
                <div className="flex gap-3 mt-6"><button type="button" onClick={handleCloseForm} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50">Отмена</button><button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-sib-blue hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl"><Save className="w-5 h-5" />{editingProduct ? "Сохранить" : "Добавить"}</button></div>
              </fetcher.Form>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{category} <span className="ml-2 text-sm font-normal text-gray-500">({filteredProducts.filter((p: Product) => p.category === category).length} блюд)</span></h2>
            {groupedProducts[category].length === 0 ? <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">В этой категории нет блюд</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedProducts[category].map((product: Product) => (
                  <div key={product.id} className={`bg-white rounded-xl shadow-md p-4 border-2 transition-all ${product.isAvailable ? "border-transparent" : "border-red-200 opacity-60"} ${!product.isVisible ? "border-orange-200 bg-orange-50" : ""}`}>
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">{product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-300" /></div>}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{product.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-sib-blue">{product.price}₽</span>
                          <div className="flex gap-1">
                            <button onClick={() => handleToggleVisibility(product.id)} className={`p-1.5 rounded-lg ${product.isVisible ? "bg-orange-100" : "bg-green-100"}`}>{product.isVisible ? <EyeOff className="w-4 h-4 text-orange-600" /> : <Eye className="w-4 h-4 text-green-600" />}</button>
                            <button onClick={() => handleEdit(product)} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"><Pencil className="w-4 h-4 text-gray-600" /></button>
                            <button onClick={() => handleDelete(product.id)} className="p-1.5 bg-red-100 hover:bg-red-200 rounded-lg"><Trash2 className="w-4 h-4 text-red-600" /></button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1"><span>{daysOfWeek[product.dayOfWeek - 1]}, </span><span>Неделя {product.weekType}</span>{!product.isVisible && <span className="text-orange-600">(скрыто)</span>}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}