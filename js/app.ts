// ==================== ГЛОБАЛЬНЫЕ ОБЪЯВЛЕНИЯ ====================
// Объявление глобального интерфейса ДО основного кода
interface Window {
    apiClient: ApiClient;
    ymaps: any;
}

// ==================== ТИПЫ ДАННЫХ ====================
interface MenuItem {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    image: string;
    isNew?: boolean;
    isActive?: boolean;
}

interface CartItem extends MenuItem {
    quantity: number;
}

interface User {
    id: number;
    email: string;
    name: string;
    studentId: string;
    isAdmin: boolean;
    phone?: string;
}

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

interface Order {
    id: number;
    userId: number;
    items: CartItem[];
    total: number;
    orderNumber: string;
    date: string;
    status: OrderStatus;
    estimatedTime?: string; // Время готовности
}

interface Feedback {
    id: number;
    name: string;
    email: string;
    message: string;
    date: string;
}

interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

// ==================== API КЛИЕНТ ====================
class ApiClient {
    private baseUrl: string = '/api';

    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data: T = await response.json();
            return data;

        } catch (error) {
            console.error('API request failed:', error);
            
            // Fallback to localStorage
            if (endpoint === '/menu' && options.method === 'GET') {
                console.log('Using localStorage fallback for menu');
                return this.getMenuFromLocalStorage() as T;
            }
            
            throw error;
        }
    }

    private getMenuFromLocalStorage(): MenuItem[] {
        const saved = localStorage.getItem('menuItems');
        if (saved) {
            return JSON.parse(saved).filter((item: MenuItem) => item.isActive !== false);
        } else {
            return [
            ];
        }
    }

    async getMenu(category?: string | null): Promise<MenuItem[]> {
        const endpoint = category && category !== 'Все' 
            ? `/menu?category=${encodeURIComponent(category)}`
            : '/menu';
        return this.request<MenuItem[]>(endpoint);
    }

    async createOrder(orderData: any): Promise<ApiResponse<{orderNumber: string}>> {
        return this.request<ApiResponse<{orderNumber: string}>>('/orders', {
            method: 'POST',
            body: orderData,
        });
    }

    async getUserProfile(userId: number): Promise<User> {
        return this.request<User>(`/users/${userId}`);
    }
}

// Создаем глобальный экземпляр ДО использования
const globalApiClient = new ApiClient();

// ==================== МЕНЕДЖЕР КОРЗИНЫ ====================
class CartManager {
    private items: CartItem[] = [];

    constructor() {
        this.loadFromStorage();
        this.updateCartDisplay();
    }

    addItem(item: MenuItem): void {
        const existingItem = findItem(this.items, (cartItem: CartItem) => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...item,
                quantity: 1
            });
        }
        
        this.saveToStorage();
        this.updateCartDisplay();
        this.showAddToCartAnimation(item.name);
    }

    removeItem(itemId: number): void {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveToStorage();
        this.updateCartDisplay();
    }

    updateQuantity(itemId: number, quantity: number): void {
        const item = findItem(this.items, (cartItem: CartItem) => cartItem.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = quantity;
            }
            this.saveToStorage();
            this.updateCartDisplay();
        }
    }

    getTotal(): number {
        return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
    }

    getItems(): CartItem[] {
        return [...this.items];
    }

    clear(): void {
        this.items = [];
        this.saveToStorage();
        this.updateCartDisplay();
    }

    private saveToStorage(): void {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    private loadFromStorage(): void {
        const saved = localStorage.getItem('cart');
        if (saved) {
            this.items = JSON.parse(saved);
        }
    }

    private updateCartDisplay(): void {
        const cartCount = document.querySelector('.cart-count') as HTMLElement;
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems.toString();
        }

        this.updateCartModal();
    }

    private updateCartModal(): void {
        const cartItems = document.querySelector('.cart-items') as HTMLElement;
        const totalPrice = document.getElementById('total-price') as HTMLElement;
        
        if (cartItems && totalPrice) {
            cartItems.innerHTML = '';
            
            if (this.items.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
            } else {
                this.items.forEach(item => {
                    const cartItemElement = document.createElement('div');
                    cartItemElement.className = 'cart-item';
                    cartItemElement.innerHTML = `
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>${item.price} ₽ × ${item.quantity}</p>
                        </div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                            <button class="remove-btn" data-id="${item.id}">🗑️</button>
                        </div>
                    `;
                    cartItems.appendChild(cartItemElement);
                });
            }
            
            totalPrice.textContent = this.getTotal().toString();
        }
    }

    private showAddToCartAnimation(itemName: string): void {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `<span>✅ "${itemName}" добавлен в корзину!</span>`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 2000);
    }
}

// ==================== МЕНЕДЖЕР ПОЛЬЗОВАТЕЛЕЙ ====================
class UserManager {
    private currentUser: User | null = null;
    private users: User[] = [];
    private orders: Order[] = [];

    constructor() {
        this.initializeUsers();
        this.loadCurrentUser();
    }

    private initializeUsers(): void {
        const adminUser: User = {
            id: 1,
            email: 'admin@sibsiu.ru',
            name: 'Администратор Столовой',
            studentId: 'ADMIN001',
            isAdmin: true
        };

        const testStudent: User = {
            id: 2,
            email: 'student@sibsiu.ru',
            name: 'Иванов Иван Иванович',
            studentId: '202412345',
            isAdmin: false
        };

        this.users = [adminUser, testStudent];
        this.saveUsersToStorage();
    }

    login(email: string, password: string): boolean {
        const user = findItem(this.users, (u: User) => u.email === email);
        if (user && password === 'password') {
            this.currentUser = user;
            this.saveCurrentUserToStorage();
            this.updateUserDisplay();
            return true;
        }
        return false;
    }

    logout(): void {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUserDisplay();
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }

    addOrder(order: Order): void {
        this.orders.push(order);
        this.saveOrdersToStorage();
    }

    getOrderHistory(userId: number): Order[] {
        return this.orders.filter(order => order.userId === userId);
    }

    private loadCurrentUser(): void {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            this.currentUser = JSON.parse(saved);
            this.updateUserDisplay();
        }
    }

    private saveCurrentUserToStorage(): void {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    private saveUsersToStorage(): void {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    private saveOrdersToStorage(): void {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    private updateUserDisplay(): void {
        const loginBtn = document.querySelector('.btn-secondary') as HTMLElement;
        const adminOrdersBtn = document.getElementById('admin-orders-btn') as HTMLElement;
        
        if (loginBtn) {
            if (this.currentUser) {
                loginBtn.textContent = 'Личный кабинет';
                loginBtn.classList.add('logged-in');
                
                // Показываем кнопку управления заказами для админа
                if (adminOrdersBtn && this.currentUser.isAdmin) {
                    adminOrdersBtn.style.display = 'block';
                }
            } else {
                loginBtn.textContent = 'Личный кабинет';
                loginBtn.classList.remove('logged-in');
                
                // Скрываем кнопку админа
                if (adminOrdersBtn) {
                    adminOrdersBtn.style.display = 'none';
                }
            }
        }
    }

    getAllOrders(): Order[] {
        const saved = localStorage.getItem('orders');
        return saved ? JSON.parse(saved) : [];
    }

    updateOrderStatus(orderId: number, newStatus: OrderStatus, estimatedTime?: string): boolean {
        const orders = this.getAllOrders();
        const orderIndex = findIndex(orders, (order: Order) => order.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            if (estimatedTime) {
                orders[orderIndex].estimatedTime = estimatedTime;
            }
            localStorage.setItem('orders', JSON.stringify(orders));
            return true;
        }
        return false;
    }

    getOrdersByStatus(status: OrderStatus): Order[] {
        const orders = this.getAllOrders();
        return orders.filter((order: Order) => order.status === status);
    }

    getUserOrders(userId: number): Order[] {
        const orders = this.getAllOrders();
        return orders.filter((order: Order) => order.userId === userId);
    }
}

// ==================== МЕНЕДЖЕР МЕНЮ ====================
class MenuManager {
    private items: MenuItem[] = [];
    private filteredItems: MenuItem[] = [];
    private allDishes: MenuItem[] = [];

    constructor() {
        this.loadMenu();
        this.setupFilters();
    }

    async loadMenu(): Promise<void> {
        try {
            const menuData = await globalApiClient.getMenu();
            this.items = menuData;
            this.filteredItems = [...this.items];
            localStorage.setItem('menuItems', JSON.stringify(this.items));
        } catch (error) {
            console.log('Using localStorage for menu data');
            this.loadMenuFromStorage();
        }
        
        this.renderMenu();
    }

    private loadMenuFromStorage(): void {
        const saved = localStorage.getItem('menuItems');
        if (saved) {
            this.items = JSON.parse(saved).filter((item: MenuItem) => item.isActive !== false);
        } else {
            this.initializeDefaultMenu();
        }
        this.filteredItems = [...this.items];
    }

    private initializeDefaultMenu(): void {
        this.items = [
        ];
        this.allDishes = [...this.items];
        this.saveMenuToStorage();
        this.saveAllDishesToStorage();
    }

    addMenuItem(item: Omit<MenuItem, 'id' | 'isActive'>): void {
        const newItem: MenuItem = {
            ...item,
            id: this.generateId(),
            isActive: true
        };
        this.items.push(newItem);
        this.allDishes.push(newItem);
        this.saveMenuToStorage();
        this.saveAllDishesToStorage();
        this.filteredItems = [...this.items];
        this.renderMenu();
    }

    updateMenuItem(itemId: number, updates: Partial<MenuItem>): void {
        const itemIndex = this.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            this.items[itemIndex] = { ...this.items[itemIndex], ...updates };
        }
        
        const allDishIndex = this.allDishes.findIndex(dish => dish.id === itemId);
        if (allDishIndex !== -1) {
            this.allDishes[allDishIndex] = { ...this.allDishes[allDishIndex], ...updates };
        }
        
        this.saveMenuToStorage();
        this.saveAllDishesToStorage();
        this.filteredItems = [...this.items];
        this.renderMenu();
    }

    addExistingDish(dishId: number): void {
        const dish = this.allDishes.find(d => d.id === dishId);
        if (dish && !this.isDishActive(dishId)) {
            const activeDish = { ...dish, isActive: true };
            this.items.push(activeDish);
            this.saveMenuToStorage();
            this.filteredItems = [...this.items];
            this.renderMenu();
        }
    }

    removeMenuItem(itemId: number): void {
        const itemIndex = this.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            this.items[itemIndex].isActive = false;
            this.items.splice(itemIndex, 1);
            this.saveMenuToStorage();
            this.filteredItems = [...this.items];
            this.renderMenu();
        }
    }

    getMenuItemById(itemId: number): MenuItem | undefined {
        return this.allDishes.find(item => item.id === itemId);
    }

    private isDishActive(dishId: number): boolean {
        return this.items.some(item => item.id === dishId);
    }

    private generateId(): number {
        const maxId = Math.max(...this.allDishes.map(dish => dish.id), 0);
        return maxId + 1;
    }

    private saveMenuToStorage(): void {
        localStorage.setItem('menuItems', JSON.stringify(this.items));
    }

    private saveAllDishesToStorage(): void {
        localStorage.setItem('allDishes', JSON.stringify(this.allDishes));
    }

    private setupFilters(): void {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                const filter = target.textContent?.trim();
                
                filterButtons.forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');
                
                this.filterItems(filter || 'Все');
            });
        });
    }

    private filterItems(category: string): void {
        if (category === 'Все') {
            this.filteredItems = [...this.items];
        } else {
            this.filteredItems = this.items.filter(item => item.category === category);
        }
        this.renderMenu();
    }

    private renderMenu(): void {
        const menuGrid = document.querySelector('.menu-grid') as HTMLElement;
        
        if (menuGrid) {
            menuGrid.innerHTML = '';
            
            this.filteredItems.forEach(item => {
                const menuItem = document.createElement('div');
                menuItem.className = 'menu-item';
                menuItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="menu-item-img">
                    <div class="menu-item-content">
                        <div class="menu-item-header">
                            <h3 class="menu-item-title">${item.name}</h3>
                            <span class="menu-item-price">${item.price} ₽</span>
                        </div>
                        ${item.isNew ? '<span class="menu-item-badge badge-new">Новинка</span>' : ''}
                        <p class="menu-item-description">${item.description}</p>
                        <button class="add-to-cart-btn" data-id="${item.id}">В корзину</button>
                        ${userManager.getCurrentUser()?.isAdmin ? 
                            `<div style="display: flex; gap: 5px; margin-top: 10px;">
                                <button class="edit-dish-btn" data-id="${item.id}" style="background: linear-gradient(135deg, #6A0DAD 0%, #8B5FBF 100%); color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; flex: 1; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 5px;"><span style="font-size: 14px;">✏️</span> Редакт.</button>
                                <button class="remove-dish-btn" data-id="${item.id}" style="background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; flex: 1; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 5px;"><span style="font-size: 14px;">🗑️</span> Удалить</button>
                            </div>` : 
                            ''}
                    </div>
                `;
                menuGrid.appendChild(menuItem);
            });
            
            this.setupAddToCartHandlers();
            this.setupRemoveDishHandlers();
            this.setupEditDishHandlers();
        }
    }

    private setupAddToCartHandlers(): void {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                const itemId = parseInt(target.getAttribute('data-id') || '0');
                const item = findItem(this.items, (i: MenuItem) => i.id === itemId);
                
                if (item) {
                    cartManager.addItem(item);
                }
            });
        });
    }

    private setupRemoveDishHandlers(): void {
        const removeButtons = document.querySelectorAll('.remove-dish-btn');
        
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                const itemId = parseInt(target.getAttribute('data-id') || '0');
                const item = this.getMenuItemById(itemId);
                
                if (item) {
                    customModalManager.showDeleteConfirm((confirmed: boolean) => {
                        if (confirmed) {
                            this.removeMenuItem(itemId);
                        }
                    });
                }
            });
        });
    }

    private setupEditDishHandlers(): void {
        const editButtons = document.querySelectorAll('.edit-dish-btn');
        
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                const itemId = parseInt(target.getAttribute('data-id') || '0');
                this.openEditModal(itemId);
            });
        });
    }

    private openEditModal(itemId: number): void {
        const item = this.getMenuItemById(itemId);
        if (!item) return;

        const editModal = document.createElement('div');
        editModal.className = 'modal';
        editModal.style.display = 'block';
        editModal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>✏️ Редактировать блюдо</h2>
                    <span class="close edit-close">&times;</span>
                </div>
                <div class="modal-body">
                    <form class="admin-form edit-dish-form" id="edit-dish-form-${itemId}">
                        <input type="text" name="name" placeholder="Название блюда" value="${this.escapeHtml(item.name)}" required>
                        <input type="number" name="price" placeholder="Цена" value="${item.price}" required>
                        <textarea name="description" placeholder="Описание" required>${this.escapeHtml(item.description)}</textarea>
                        <select name="category" required>
                            <option value="">Выберите раздел</option>
                            <option value="Первые блюда" ${item.category === 'Первые блюда' ? 'selected' : ''}>Первые блюда</option>
                            <option value="Вторые блюда" ${item.category === 'Вторые блюда' ? 'selected' : ''}>Вторые блюда</option>
                            <option value="Салаты" ${item.category === 'Салаты' ? 'selected' : ''}>Салаты</option>
                            <option value="Выпечка" ${item.category === 'Выпечка' ? 'selected' : ''}>Выпечка</option>
                            <option value="Напитки" ${item.category === 'Напитки' ? 'selected' : ''}>Напитки</option>
                        </select>
                        <input type="url" name="image" placeholder="Ссылка на изображение" value="${this.escapeHtml(item.image)}" required>
                        <label style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f8f9fa; border-radius: 10px; cursor: pointer; transition: all 0.3s ease;">
                            <input type="checkbox" name="isNew" ${item.isNew ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--purple);">
                            <span style="font-weight: 500;">🎯 Отметить как новинку</span>
                        </label>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <button type="submit" class="btn btn-primary" style="flex: 1; padding: 12px; font-weight: 600; background: linear-gradient(135deg, var(--orange) 0%, #FF8C42 100%); color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px;"><span>💾</span> Сохранить</button>
                            <button type="button" class="cancel-edit" style="flex: 1; padding: 12px; font-weight: 600; background: linear-gradient(135deg, #b41313ff 0%, #d83939ff 100%); color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px;"><span>❌</span> Отмена</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(editModal);
        document.body.style.overflow = 'hidden';

        const closeBtn = editModal.querySelector('.edit-close') as HTMLElement;
        const cancelBtn = editModal.querySelector('.cancel-edit') as HTMLElement;
        const form = editModal.querySelector(`#edit-dish-form-${itemId}`) as HTMLFormElement;

        const closeModal = () => {
            document.body.removeChild(editModal);
            document.body.style.overflow = 'auto';
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            const updates: Partial<MenuItem> = {
                name: formData.get('name') as string,
                price: parseInt(formData.get('price') as string),
                description: formData.get('description') as string,
                category: formData.get('category') as string,
                image: formData.get('image') as string,
                isNew: (formData.get('isNew') as string) === 'on'
            };

            this.updateMenuItem(itemId, updates);
            closeModal();
            
            // Вместо alert используем тост
            showNotification('Сохранено', 'Изменения успешно сохранены', 'success');
        });

        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeModal();
            }
        });
    }

    private escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    getMenuItems(): MenuItem[] {
        return [...this.items];
    }

    getAllDishes(): MenuItem[] {
        return [...this.allDishes];
    }

    getInactiveDishes(): MenuItem[] {
        const activeIds = this.items.map(item => item.id);
        return this.allDishes.filter(dish => !activeIds.includes(dish.id));
    }

    deletePermanent(itemId: number): void {
        const allDishIndex = this.allDishes.findIndex(dish => dish.id === itemId);
        if (allDishIndex !== -1) {
            this.allDishes.splice(allDishIndex, 1);
        }
        
        const menuIndex = this.items.findIndex(item => item.id === itemId);
        if (menuIndex !== -1) {
            this.items.splice(menuIndex, 1);
        }
        
        this.saveMenuToStorage();
        this.saveAllDishesToStorage();
        this.filteredItems = [...this.items];
        this.renderMenu();
    }
}

// ==================== МЕНЕДЖЕР МОДАЛЬНЫХ ОКОН ====================
class ModalManager {
    private modals: SimpleMap<string, HTMLElement> = new SimpleMap();

    constructor() {
        this.initializeModals();
        this.setupEventListeners();
    }

    private initializeModals(): void {
        const modalElements = document.querySelectorAll('.modal');
        
        modalElements.forEach(modal => {
            const id = modal.id;
            this.modals.set(id, modal as HTMLElement);
        });
    }

    private setupEventListeners(): void {
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => {
                this.openModal('cart-modal');
            });
        }

        const loginBtn = document.querySelector('.btn-secondary');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                if (userManager.getCurrentUser()) {
                    this.openModal('profile-modal');
                    this.updateProfileModal();
                } else {
                    this.openModal('login-modal');
                }
            });
        }

        const adminOrdersBtn = document.getElementById('admin-orders-btn');
        if (adminOrdersBtn) {
            adminOrdersBtn.addEventListener('click', () => {
                this.openModal('admin-orders-modal');
                orderManager.loadAdminOrders('all');
            });
        }

        const feedbackLink = document.getElementById('feedback-link');
        if (feedbackLink) {
            feedbackLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openModal('feedback-modal');
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target instanceof HTMLElement) {
                this.modals.forEach((modal: HTMLElement, id: string) => {
                    if (e.target === modal) {
                        this.closeModal(id);
                    }
                });
            }
        });
    }

    openModal(modalId: string): void {
        const modal = this.modals.get(modalId);
        if (modal) {
            this.closeAllModals();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId: string): void {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    closeAllModals(): void {
        this.modals.forEach((modal: HTMLElement, id: string) => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }

    private updateProfileModal(): void {
        const user = userManager.getCurrentUser();
        if (user) {
            const userName = document.getElementById('profile-name') as HTMLElement;
            const studentId = document.getElementById('profile-student-id') as HTMLElement;
            const orderHistory = document.getElementById('order-history') as HTMLElement;
            const adminPanel = document.getElementById('admin-panel') as HTMLElement;

            if (userName) userName.textContent = user.name;
            if (studentId) studentId.textContent = user.studentId;

            if (orderHistory) {
                orderManager.updateUserOrderDisplay(user.id);
            }

            if (adminPanel) {
                adminPanel.style.display = user.isAdmin ? 'block' : 'none';
                if (user.isAdmin) {
                    this.updateAdminPanel();
                }
            }
        }
    }

    private updateAdminPanel(): void {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            const inactiveDishes = menuManager.getInactiveDishes();
            
            // УДАЛЯЕМ старую секцию если существует
            const existingSection = adminPanel.querySelector('.existing-dishes-section');
            if (existingSection) {
                existingSection.remove();
            }
            
            let existingDishesHTML = '';
            
            if (inactiveDishes.length > 0) {
                existingDishesHTML = `
                    <div class="existing-dishes-section" style="margin-top: 20px; padding: 25px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 15px; border: 2px dashed var(--purple);">
                        <h4 style="color: var(--purple); margin-bottom: 15px; text-align: center; font-size: 1.2rem;">📁 Добавить из существующих блюд</h4>
                        <div class="existing-dishes-list" style="max-height: 250px; overflow-y: auto; border-radius: 10px;">
                `;
                
                inactiveDishes.forEach(dish => {
                    existingDishesHTML += `
                        <div class="existing-dish-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin: 8px 0; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); transition: all 0.3s ease;">
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: var(--dark-gray); margin-bottom: 5px;">${dish.name}</div>
                                <div style="display: flex; gap: 15px; align-items: center; font-size: 0.9rem;">
                                    <span style="color: var(--orange); font-weight: 600;">${dish.price} ₽</span>
                                    <span style="color: #6c757d;">${dish.category}</span>
                                    ${dish.isNew ? '<span style="background: #3182CE; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8em;">Новинка</span>' : ''}
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn-add-existing" data-id="${dish.id}" style="background: linear-gradient(135deg, #38A169 0%, #2F855A 100%); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.3s ease;">
                                    ➕
                                </button>
                                <button class="btn-delete-permanent" data-id="${dish.id}" style="background: linear-gradient(135deg, #E53E3E 0%, #C53030 100%); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.3s ease;">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    `;
                });
                
                existingDishesHTML += `
                        </div>
                        <p style="margin: 15px 0 0 0; font-size: 0.9rem; color: #6c757d; text-align: center;">
                            💡 Удаление блюда невозможно отменить - оно будет удалено из архива навсегда
                        </p>
                    </div>
                `;
            } else {
                existingDishesHTML = `
                    <div class="existing-dishes-section" style="margin-top: 20px; padding: 25px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 15px; border: 2px dashed var(--purple); text-align: center;">
                        <h4 style="color: var(--purple); margin-bottom: 10px; font-size: 1.2rem;">📁 Архив блюд</h4>
                        <p style="color: #6c757d; margin: 0;">Нет сохраненных блюд для добавления</p>
                    </div>
                `;
            }

            // УБИРАЕМ ДУБЛИРОВАНИЕ - добавляем только один раз
            const addMenuItemForm = adminPanel.querySelector('#add-menu-item-form');
            if (addMenuItemForm) {
                addMenuItemForm.insertAdjacentHTML('afterend', existingDishesHTML);
            }

            // Обработчики кнопок
            const addButtons = adminPanel.querySelectorAll('.btn-add-existing');
            addButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const target = e.target as HTMLButtonElement;
                    const dishId = parseInt(target.getAttribute('data-id') || '0');
                    menuManager.addExistingDish(dishId);
                    alert('✅ Блюдо добавлено в меню!');
                    this.updateAdminPanel();
                });
            });

            const deleteButtons = adminPanel.querySelectorAll('.btn-delete-permanent');
            deleteButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const target = e.target as HTMLButtonElement;
                    const dishId = parseInt(target.getAttribute('data-id') || '0');
                    const dish = menuManager.getMenuItemById(dishId);
                    
                    if (dish && confirm(`❌ Вы уверены, что хотите навсегда удалить блюдо "${dish.name}"?\n\nЭто действие нельзя отменить!`)) {
                        menuManager.deletePermanent(dishId);
                        alert('✅ Блюдо удалено из архива!');
                        this.updateAdminPanel();
                    }
                });
            });
        }
    }
}

// ==================== МЕНЕДЖЕР КАСТОМНЫХ МОДАЛЬНЫХ ОКОН ====================
// ==================== МЕНЕДЖЕР КАСТОМНЫХ МОДАЛЬНЫХ ОКОН ====================
class CustomModalManager {
    private activeModalId: string | null = null;
    private currentCallback: ((result: boolean | string) => void) | null = null;
    private currentData: any = null;

    constructor() {
        this.setupEventListeners();
        this.setupTimeValidation();
    }

    private setupEventListeners(): void {
        // Обработчики для модалки удаления
        const deleteCancelBtn = document.getElementById('delete-cancel-btn');
        const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
        
        if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', () => this.closeModal(false));
        if (deleteConfirmBtn) deleteConfirmBtn.addEventListener('click', () => this.closeModal(true));

        // Обработчики для модалки пустой корзины
        const emptyCartBtn = document.getElementById('empty-cart-ok-btn');
        if (emptyCartBtn) emptyCartBtn.addEventListener('click', () => this.closeModal(true));

        // Обработчики для модалки отмены заказа
        const cancelOrderCancelBtn = document.getElementById('cancel-order-cancel-btn');
        const cancelOrderConfirmBtn = document.getElementById('cancel-order-confirm-btn');
        
        if (cancelOrderCancelBtn) cancelOrderCancelBtn.addEventListener('click', () => this.closeModal(false));
        if (cancelOrderConfirmBtn) cancelOrderConfirmBtn.addEventListener('click', () => this.closeModal(true));

        // Обработчики для модалки установки времени
        const setTimeCancelBtn = document.getElementById('set-time-cancel-btn');
        if (setTimeCancelBtn) setTimeCancelBtn.addEventListener('click', () => this.closeModal(false));

        const setTimeForm = document.getElementById('set-time-form') as HTMLFormElement;
        if (setTimeForm) {
            setTimeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const timeInput = document.getElementById('time-input') as HTMLInputElement;
                if (this.validateTimeFormat(timeInput.value)) {
                    this.closeModal(timeInput.value);
                } else {
                    showNotification('Ошибка', 'Пожалуйста, введите время в правильном формате ЧЧ:ММ (например: 14:30)', 'warning');
                    timeInput.focus();
                }
            });
        }

        // Обработчик для модалки благодарности
        const thankYouBtn = document.getElementById('thank-you-ok-btn');
        if (thankYouBtn) thankYouBtn.addEventListener('click', () => this.closeModal(true));

        // Обработчики для модалки входа в систему
        const loginRequiredCancelBtn = document.getElementById('login-required-cancel-btn');
        const loginRequiredLoginBtn = document.getElementById('login-required-login-btn');
        
        if (loginRequiredCancelBtn) loginRequiredCancelBtn.addEventListener('click', () => this.closeModal(false));
        if (loginRequiredLoginBtn) loginRequiredLoginBtn.addEventListener('click', () => this.closeModal(true));

        // Обработчики для модалки успешного входа
        const loginSuccessOkBtn = document.getElementById('login-success-ok-btn');
        if (loginSuccessOkBtn) loginSuccessOkBtn.addEventListener('click', () => this.closeModal(true));

        // Обработчики для модалки успешного выхода
        const logoutSuccessOkBtn = document.getElementById('logout-success-ok-btn');
        if (logoutSuccessOkBtn) logoutSuccessOkBtn.addEventListener('click', () => this.closeModal(true));

        // Обработчики для модалки добавления блюда
        const dishAddedOkBtn = document.getElementById('dish-added-ok-btn');
        if (dishAddedOkBtn) dishAddedOkBtn.addEventListener('click', () => this.closeModal(true));

        // Закрытие по клику на оверлей
        document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(false);
                }
            });
        });
    }

    private setupTimeValidation(): void {
        const timeInput = document.getElementById('time-input');
        if (timeInput) {
            timeInput.addEventListener('input', (e) => {
                const input = e.target as HTMLInputElement;
                let value = input.value.replace(/\D/g, '');
                
                if (value.length > 0) {
                    value = value.substring(0, 4);
                    
                    // Форматируем как ЧЧ:ММ
                    if (value.length >= 3) {
                        value = value.substring(0, 2) + ':' + value.substring(2);
                    }
                    
                    // Проверяем часы
                    if (value.length >= 2) {
                        const hours = parseInt(value.substring(0, 2));
                        if (hours > 23) {
                            value = '23' + value.substring(2);
                        }
                    }
                    
                    // Проверяем минуты
                    if (value.length >= 5) {
                        const minutes = parseInt(value.substring(3, 5));
                        if (minutes > 59) {
                            value = value.substring(0, 3) + '59';
                        }
                    }
                }
                
                input.value = value;
            });

            // Добавляем placeholder при фокусе
            timeInput.addEventListener('focus', () => {
                const input = timeInput as HTMLInputElement;
                if (!input.value) {
                    input.value = '14:30';
                    input.select();
                }
            });

            timeInput.addEventListener('blur', () => {
                const input = timeInput as HTMLInputElement;
                if (input.value === '14:30' && !input.hasAttribute('data-changed')) {
                    input.value = '';
                }
            });

            timeInput.addEventListener('input', () => {
                const input = timeInput as HTMLInputElement;
                input.setAttribute('data-changed', 'true');
            });
        }
    }

    private validateTimeFormat(time: string): boolean {
        const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    showDeleteConfirm(callback: (confirmed: boolean) => void): void {
        this.showModal('delete-confirm-modal', callback);
    }

    showEmptyCartAlert(callback: () => void): void {
        this.showModal('empty-cart-modal', callback);
    }

    showCancelOrderConfirm(callback: (confirmed: boolean) => void): void {
        this.showModal('cancel-order-modal', callback);
    }

    showSetTimeForm(callback: (time: string | false) => void): void {
        const timeInput = document.getElementById('time-input') as HTMLInputElement;
        if (timeInput) {
            timeInput.value = '';
            timeInput.removeAttribute('data-changed');
        }
        this.showModal('set-time-modal', callback);
    }

    showThankYouModal(callback: () => void): void {
        this.showModal('thank-you-modal', callback);
    }

    showLoginRequired(callback: (shouldLogin: boolean) => void): void {
        this.showModal('login-required-modal', callback);
    }

    showLoginSuccess(callback: () => void): void {
        this.showModal('login-success-modal', callback);
    }

    showLogoutSuccess(callback: () => void): void {
        this.showModal('logout-success-modal', callback);
    }

    showDishAdded(callback: () => void): void {
        this.showModal('dish-added-modal', callback);
    }

    private showModal(modalId: string, callback: (result: any) => void, data?: any): void {
        this.closeActiveModal();
        
        const modal = document.getElementById(modalId) as HTMLElement;
        if (modal) {
            modal.style.display = 'block';
            this.activeModalId = modalId;
            this.currentCallback = callback;
            this.currentData = data;
            document.body.style.overflow = 'hidden';
        }
    }

    private closeModal(result: any): void {
        if (this.activeModalId) {
            const modal = document.getElementById(this.activeModalId) as HTMLElement;
            if (modal) {
                modal.style.display = 'none';
            }
            
            if (this.currentCallback) {
                this.currentCallback(result);
            }
            
            this.activeModalId = null;
            this.currentCallback = null;
            this.currentData = null;
            document.body.style.overflow = 'auto';
        }
    }

    private closeActiveModal(): void {
        if (this.activeModalId) {
            const modal = document.getElementById(this.activeModalId) as HTMLElement;
            if (modal) {
                modal.style.display = 'none';
            }
            this.activeModalId = null;
            this.currentCallback = null;
            this.currentData = null;
        }
    }
}

// ==================== КЛАСС ДЛЯ ПРОКРУТКИ И ФИЛЬТРАЦИИ ====================
class ScrollManager {
    constructor() {
        this.setupScrollButtons();
        this.setupFooterFilterButtons();
        this.initializeYandexMap();
    }

    private setupScrollButtons(): void {
        // Кнопка "Посмотреть меню"
        const viewMenuBtn = document.querySelector('.hero-buttons .btn-primary');
        if (viewMenuBtn) {
            viewMenuBtn.addEventListener('click', () => {
                this.scrollToSection('menu');
            });
        }

        // Кнопка "О столовой"
        const aboutBtn = document.querySelector('.hero-buttons .btn-secondary');
        if (aboutBtn) {
            aboutBtn.addEventListener('click', () => {
                this.scrollToSection('contacts');
            });
        }
    }

    private setupFooterFilterButtons(): void {
        const footerLinks = document.querySelectorAll('.footer-links a');
        
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const text = link.textContent?.toLowerCase() || '';
                
                // Маппинг текста кнопок на категории
                const categoryMap: {[key: string]: string} = {
                    'первые блюда': 'Первые блюда',
                    'вторые блюда': 'Вторые блюда',
                    'салаты': 'Салаты',
                    'выпечка': 'Выпечка',
                    'напитки': 'Напитки'
                };
                
                if (categoryMap[text]) {
                    // Прокручиваем к меню
                    this.scrollToSection('menu');
                    
                    // Активируем соответствующий фильтр
                    setTimeout(() => {
                        this.activateFilterButton(categoryMap[text]);
                    }, 500);
                } else if (text.includes('контакты')) {
                    this.scrollToSection('contacts');
                }
            });
        });
    }

    private scrollToSection(sectionId: string): void {
        const section = document.getElementById(sectionId);
        if (section) {
            const header = document.querySelector('header') as HTMLElement;
            const headerHeight = header ? header.offsetHeight : 80;
            const offsetTop = section.offsetTop - headerHeight;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    private activateFilterButton(category: string): void {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            if (btn.textContent?.trim() === category) {
                btn.classList.add('active');
                // Триггерим клик для фильтрации
                (btn as HTMLButtonElement).click();
            } else {
                btn.classList.remove('active');
            }
        });
    }

    private initializeYandexMap(): void {
        const mapContainer = document.querySelector('.map');
        if (!mapContainer) return;

        // Убираем placeholder и добавляем контейнер для карты
        const placeholder = mapContainer.querySelector('.map-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        const mapDiv = document.createElement('div');
        mapDiv.id = 'yandex-map';
        mapContainer.appendChild(mapDiv);

        // Инициализация Яндекс Карты
        this.loadYandexMap();
    }

    private loadYandexMap(): void {
        // Проверяем, загружена ли уже карта
        if ((window as any).ymaps) {
            this.initMap();
        } else {
            // Загружаем API Яндекс Карт
            const script = document.createElement('script');
            script.src = 'https://api-maps.yandex.ru/2.1/?apikey=НУЖЕН_АПИ_КЛЮЧ&lang=ru_RU';
            script.onload = () => this.initMap();
            document.head.appendChild(script);
        }
    }

    private initMap(): void {
        const ymaps = (window as any).ymaps;
        
        ymaps.ready(() => {
            const map = new ymaps.Map('yandex-map', {
                center: [53.756286, 87.128606], // Координаты Новокузнецка
                zoom: 16
            });

            // Добавляем метку
            const placemark = new ymaps.Placemark([53.756286, 87.128606], {
                balloonContent: `
                    <strong>Столовая СибГИУ</strong><br>
                    г. Новокузнецк, Центральный район, ул. Кирова, здание 42<br>
                    📞 +7 (3843) 74-35-33
                `
            }, {
                preset: 'islands#redFoodIcon'
            });

            map.geoObjects.add(placemark);

            // Открываем балун при загрузке
            placemark.balloon.open();
        });
    }
}

// ==================== МЕНЕДЖЕР ОБРАТНОЙ СВЯЗИ ====================
class FeedbackManager {
    private feedbacks: Feedback[] = [];

    constructor() {
        this.loadFeedbacksFromStorage();
        this.setupFeedbackForm();
        this.setupFeedbackModal();
    }

    private loadFeedbacksFromStorage(): void {
        const saved = localStorage.getItem('feedbacks');
        if (saved) {
            this.feedbacks = JSON.parse(saved);
        }
    }

    private setupFeedbackForm(): void {
        const form = document.getElementById('feedback-modal-form') as HTMLFormElement;
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFeedback(form);
            });
        }
    }

    private setupFeedbackModal(): void {
        // Добавляем улучшенный дизайн для модалки обратной связи
        const feedbackModal = document.getElementById('feedback-modal');
        if (feedbackModal) {
            const modalContent = feedbackModal.querySelector('.modal-content') as HTMLElement;
            if (modalContent) {
                modalContent.style.maxWidth = '500px';
                modalContent.style.padding = '40px';
            }
        }
    }

    private handleFeedback(form: HTMLFormElement): void {
        const formData = new FormData(form);
        const feedback: Feedback = {
            id: this.generateFeedbackId(),
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            message: formData.get('message') as string,
            date: new Date().toLocaleString('ru-RU')
        };

        this.feedbacks.push(feedback);
        this.saveFeedbacksToStorage();
        
        // Закрываем модалку обратной связи
        modalManager.closeModal('feedback-modal');
        
        // Показываем кастомное окно благодарности
        setTimeout(() => {
            customModalManager.showThankYouModal(() => {
                console.log('Пользователь закрыл окно благодарности');
            });
        }, 300);
        
        form.reset();
    }

    private generateFeedbackId(): number {
        const maxId = Math.max(...this.feedbacks.map(f => f.id), 0);
        return maxId + 1;
    }

    private saveFeedbacksToStorage(): void {
        localStorage.setItem('feedbacks', JSON.stringify(this.feedbacks));
    }
}

// ==================== МЕНЕДЖЕР ЗАКАЗОВ ====================
class OrderManager {
    private userManager: UserManager;

    constructor(userManager: UserManager) {
        this.userManager = userManager;
    }

    // Загрузка заказов для админ-панели
    loadAdminOrders(filterStatus: string = 'all'): void {
        const ordersList = document.getElementById('admin-orders-list');
        if (!ordersList) return;

        const allOrders = this.userManager.getAllOrders();
        
        // Сортируем по дате (новые сверху)
        const sortedOrders = allOrders.sort((a: Order, b: Order) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Фильтруем по статусу
        const filteredOrders = filterStatus === 'all' 
            ? sortedOrders 
            : sortedOrders.filter((order: Order) => order.status === filterStatus);

        this.renderAdminOrders(ordersList, filteredOrders);
    }

    private renderAdminOrders(container: HTMLElement, orders: Order[]): void {
        if (orders.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">Заказы не найдены</p>';
            return;
        }

        let ordersHTML = '';

        orders.forEach((order: Order) => {
            const user = this.getUserById(order.userId);
            const itemsHTML = this.renderOrderItems(order.items);
            
            ordersHTML += `
                <div class="admin-order-item" data-order-id="${order.id}">
                    <div class="admin-order-header">
                        <div class="admin-order-info">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                <strong>Заказ #${order.orderNumber}</strong>
                                <span class="order-status status-${order.status}">
                                    ${this.getStatusText(order.status)}
                                </span>
                                ${order.estimatedTime ? 
                                    `<span class="estimated-time">⏰ ${order.estimatedTime}</span>` : 
                                    ''
                                }
                            </div>
                            <div style="font-size: 0.9rem; color: #6c757d;">
                                <div>👤 ${user?.name || 'Неизвестный пользователь'}</div>
                                <div>📧 ${user?.email || 'Нет email'}</div>
                                <div>🎓 ${user?.studentId || 'Нет студенческого'}</div>
                                <div>📅 ${order.date}</div>
                                <div>💰 ${order.total} ₽</div>
                            </div>
                        </div>
                    </div>

                    <div class="order-items-list">
                        <strong>Состав заказа:</strong>
                        ${itemsHTML}
                    </div>

                    <div class="order-actions">
                        ${this.renderStatusButtons(order.status, order.id)}
                    </div>
                </div>
            `;
        });

        container.innerHTML = ordersHTML;
        this.setupOrderActionHandlers();
    }

    private renderOrderItems(items: CartItem[]): string {
        return items.map(item => `
            <div class="order-item-row">
                <span>${item.name}</span>
                <span>${item.quantity} × ${item.price} ₽ = ${item.quantity * item.price} ₽</span>
            </div>
        `).join('');
    }

    private renderStatusButtons(currentStatus: OrderStatus, orderId: number): string {
        const buttons = [];
        
        if (currentStatus === 'pending') {
            buttons.push(`
                <button class="status-btn btn-preparing" data-action="preparing" data-order="${orderId}">
                    👨‍🍳 Начать готовить
                </button>
                <button class="status-btn btn-cancelled" data-action="cancelled" data-order="${orderId}">
                    ❌ Отменить
                </button>
            `);
        }
        
        if (currentStatus === 'preparing') {
            buttons.push(`
                <button class="status-btn btn-ready" data-action="ready" data-order="${orderId}">
                    ✅ Готов
                </button>
                <button class="status-btn btn-cancelled" data-action="cancelled" data-order="${orderId}">
                    ❌ Отменить
                </button>
            `);
        }
        
        if (currentStatus === 'ready') {
            buttons.push(`
                <button class="status-btn btn-completed" data-action="completed" data-order="${orderId}">
                    📦 Выдан
                </button>
            `);
        }

        // Для всех статусов кроме завершенных и отмененных
        if (currentStatus !== 'completed' && currentStatus !== 'cancelled') {
            buttons.push(`
                <button class="status-btn" data-action="set_time" data-order="${orderId}" 
                    style="background: #FFA726; color: white;">
                    ⏰ Установить время
                </button>
            `);
        }

        return buttons.join('');
    }

    private getStatusText(status: OrderStatus): string {
        const statusTexts: Record<OrderStatus, string> = {
            'pending': 'Ожидание',
            'preparing': 'Готовится',
            'ready': 'Готов',
            'completed': 'Выполнен',
            'cancelled': 'Отменен'
        };
        return statusTexts[status];
    }

    private setupOrderActionHandlers(): void {
        // Обработчики кнопок смены статуса
        document.querySelectorAll('.status-btn[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                const orderId = parseInt(target.getAttribute('data-order') || '0');
                const action = target.getAttribute('data-action');
                
                this.handleOrderAction(orderId, action);
            });
        });
    }

    private handleOrderAction(orderId: number, action: string | null): void {
        switch (action) {
            case 'preparing':
                this.userManager.updateOrderStatus(orderId, 'preparing');
                this.loadAdminOrders(document.querySelector('.filter-order-btn.active')?.getAttribute('data-status') || 'all');
                break;
            case 'ready':
                this.userManager.updateOrderStatus(orderId, 'ready');
                this.loadAdminOrders(document.querySelector('.filter-order-btn.active')?.getAttribute('data-status') || 'all');
                break;
            case 'completed':
                this.userManager.updateOrderStatus(orderId, 'completed');
                this.loadAdminOrders(document.querySelector('.filter-order-btn.active')?.getAttribute('data-status') || 'all');
                break;
            case 'cancelled':
                customModalManager.showCancelOrderConfirm((confirmed: boolean) => {
                    if (confirmed) {
                        this.userManager.updateOrderStatus(orderId, 'cancelled');
                        this.loadAdminOrders(document.querySelector('.filter-order-btn.active')?.getAttribute('data-status') || 'all');
                    }
                });
                break;
            case 'set_time':
                customModalManager.showSetTimeForm((time: string | false) => {
                    if (time) {
                        this.userManager.updateOrderStatus(orderId, 'preparing', time);
                        this.loadAdminOrders(document.querySelector('.filter-order-btn.active')?.getAttribute('data-status') || 'all');
                    }
                });
                break;
            default:
                this.loadAdminOrders(document.querySelector('.filter-order-btn.active')?.getAttribute('data-status') || 'all');
                break;
        }
    }

    private getUserById(userId: number): User | undefined {
        const usersStr = localStorage.getItem('users');
        if (usersStr) {
            const users: User[] = JSON.parse(usersStr);
            return findItem(users, (user: User) => user.id === userId);
        }
        return undefined;
    }

    // Обновление отображения заказов пользователя
    updateUserOrderDisplay(userId: number): void {
        const orderHistory = document.getElementById('order-history');
        if (!orderHistory) return;

        const userOrders = this.userManager.getUserOrders(userId);
        const sortedOrders = userOrders.sort((a: Order, b: Order) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        if (sortedOrders.length === 0) {
            orderHistory.innerHTML = '<p>История заказов пуста</p>';
            return;
        }

        let ordersHTML = '';
        
        sortedOrders.forEach((order: Order) => {
            const itemsList = order.items.map(item => 
                `${item.name} (${item.quantity} × ${item.price} ₽)`
            ).join(', ');
            
            ordersHTML += `
                <div class="order-item">
                    <div class="order-header">
                        <span class="order-number">Заказ #${order.orderNumber}</span>
                        <span class="order-date">${order.date}</span>
                    </div>
                    <div class="order-details">
                        <div class="order-status status-${order.status}">
                            ${this.getStatusText(order.status)}
                        </div>
                        ${order.estimatedTime ? 
                            `<div class="estimated-time">⏰ ${order.estimatedTime}</div>` : 
                            ''
                        }
                        <div class="order-items">🍽️ ${itemsList}</div>
                        <div class="order-total">💰 Сумма: ${order.total} ₽</div>
                    </div>
                </div>
            `;
        });

        orderHistory.innerHTML = ordersHTML;
    }
}


// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function findItem<T>(array: T[], predicate: (item: T) => boolean): T | undefined {
    for (let i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            return array[i];
        }
    }
    return undefined;
}

function findIndex<T>(array: T[], predicate: (item: T) => boolean): number {
    for (let i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            return i;
        }
    }
    return -1;
}

// Простая реализация Map для совместимости
class SimpleMap<K, V> {
    private items: Array<{key: K, value: V}> = [];

    set(key: K, value: V): void {
        const index = findIndex(this.items, (item: {key: K, value: V}) => item.key === key);
        if (index !== -1) {
            this.items[index].value = value;
        } else {
            this.items.push({key, value});
        }
    }

    get(key: K): V | undefined {
        const item = findItem(this.items, (item: {key: K, value: V}) => item.key === key);
        return item ? item.value : undefined;
    }

    has(key: K): boolean {
        return findIndex(this.items, (item: {key: K, value: V}) => item.key === key) !== -1;
    }

    forEach(callback: (value: V, key: K) => void): void {
        this.items.forEach(item => callback(item.value, item.key));
    }
}

function setupMobileMenu(): void {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn') as HTMLElement;
    const nav = document.querySelector('nav') as HTMLElement;
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
}

function updateWorkingHours(): void {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    const isOpen = (day >= 1 && day <= 4 && hour >= 8 && hour < 16) || 
                   (day === 5 && hour >= 8 && hour < 15);
    
    const statusElement = document.querySelector('.working-status');
    if (statusElement) {
        statusElement.textContent = isOpen ? '🟢 Сейчас открыто' : '🔴 Сейчас закрыто';
    }
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ УВЕДОМЛЕНИЙ ====================
function showNotification(title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info'): void {
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">${getNotificationIcon(type)}</div>
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 400);
    }, 5000);
}

function getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
        'success': '✅',
        'warning': '⚠️',
        'error': '❌',
        'info': 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}
function processOrder(): void {
    try {
        const user = userManager.getCurrentUser();
        if (!user) {
            customModalManager.showLoginRequired((shouldLogin: boolean) => {
                if (shouldLogin) {
                    modalManager.openModal('login-modal');
                }
            });
            return;
        }

        const cartItems = cartManager.getItems();
        if (cartItems.length === 0) {
            customModalManager.showEmptyCartAlert(() => {
                console.log('Пользователь подтвердил, что корзина пуста');
            });
            return;
        }

        // ПРОВЕРКА ВЫБРАННОГО ВРЕМЕНИ
        const timeSelect = document.getElementById('order-time') as HTMLSelectElement;
        const selectedTime = timeSelect.value;
        
        if (!selectedTime) {
            showNotification('Внимание', 'Пожалуйста, выберите время получения заказа', 'warning');
            return;
        }

        const total = cartManager.getTotal();
        const orderNumber = 'ORD' + Date.now().toString().slice(-6);
        
        // Создаем заказ с выбранным временем
        const order: Order = {
            id: Date.now(),
            userId: user.id,
            items: cartItems.slice(),
            total: total,
            orderNumber: orderNumber,
            date: new Date().toLocaleString('ru-RU'),
            status: 'pending',
            estimatedTime: selectedTime
        };

        userManager.addOrder(order);
        
        // Подготавливаем данные для оплаты
        const paymentParams = new URLSearchParams();
        paymentParams.append('service_type', 'canteen');
        paymentParams.append('student_fio', user.name);
        paymentParams.append('payer_fio', user.name);
        paymentParams.append('pay_summ', total.toString());
        paymentParams.append('email', user.email);
        paymentParams.append('comment', `Оплата заказа столовой №${orderNumber}`);
        
        const paymentUrl = `https://pay.sibsiu.ru/?${paymentParams.toString()}`;
        
        // Пытаемся открыть в новой вкладке
        const newWindow = window.open(paymentUrl, '_blank');
        
        if (!newWindow) {
            showNotification('Заказ оформлен', `Заказ №${orderNumber} оформлен! Если страница оплаты не открылась автоматически, перейдите по ссылке вручную.`, 'info');
        } else {
            showNotification('Успешно', `Заказ №${orderNumber} оформлен! Открыта страница оплаты.`, 'success');
        }
        
        // Очищаем корзину
        cartManager.clear();
        modalManager.closeModal('cart-modal');
        
    } catch (error) {
        console.error('Order processing error:', error);
        showNotification('Ошибка', 'Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.', 'error');
    }
}

function setupAdminPanel(): void {
    const addMenuItemForm = document.getElementById('add-menu-item-form') as HTMLFormElement;
    
    if (addMenuItemForm) {
        addMenuItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(addMenuItemForm);
            
            // Валидация
            const name = formData.get('name') as string;
            const price = formData.get('price') as string;
            const description = formData.get('description') as string;
            const category = formData.get('category') as string;
            const image = formData.get('image') as string;
            
            if (!name || !price || !description || !category || !image) {
                showNotification('Ошибка', 'Пожалуйста, заполните все поля', 'warning');
                return;
            }

            if (parseInt(price) <= 0) {
                showNotification('Ошибка', 'Цена должна быть больше 0', 'warning');
                return;
            }
            
            const newItem: Omit<MenuItem, 'id' | 'isActive'> = {
                name,
                price: parseInt(price),
                description,
                category,
                image,
                isNew: (formData.get('isNew') as string) === 'on'
            };
            
            menuManager.addMenuItem(newItem);
            addMenuItemForm.reset();
            
            // Показываем кастомное окно успешного добавления
            customModalManager.showDishAdded(() => {
                console.log('Блюдо успешно добавлено в меню');
            });
        });
    }

    // Обработчики для кнопок "Редактировать" и "Удалить" в меню
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        
        // Обработка добавления существующего блюда
        if (target.classList.contains('btn-add-existing')) {
            const dishId = parseInt(target.getAttribute('data-id') || '0');
            menuManager.addExistingDish(dishId);
            showNotification('Успешно', 'Блюдо добавлено в меню', 'success');
        }
        
        // Обработка удаления блюда навсегда
        if (target.classList.contains('btn-delete-permanent')) {
            const dishId = parseInt(target.getAttribute('data-id') || '0');
            const dish = menuManager.getMenuItemById(dishId);
            
            if (dish) {
                customModalManager.showDeleteConfirm((confirmed: boolean) => {
                    if (confirmed) {
                        menuManager.deletePermanent(dishId);
                        showNotification('Удалено', 'Блюдо удалено из архива', 'success');
                        
                        // Обновляем панель админа
                        setTimeout(() => {
                            const adminPanel = document.getElementById('admin-panel');
                            if (adminPanel && adminPanel.style.display !== 'none') {
                                modalManager.openModal('profile-modal');
                            }
                        }, 500);
                    }
                });
            }
        }
    });
}

function setupEventHandlers(): void {
    // Обработчики корзины
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        
        if (target.classList.contains('quantity-btn')) {
            const itemId = parseInt(target.getAttribute('data-id') || '0');
            const isPlus = target.classList.contains('plus');
            
            const cartItem = cartManager.getItems().find(item => item.id === itemId);
            if (cartItem) {
                const newQuantity = isPlus ? cartItem.quantity + 1 : cartItem.quantity - 1;
                cartManager.updateQuantity(itemId, newQuantity);
                
                // Показываем уведомление об изменении количества
                if (newQuantity > 0) {
                    const itemName = cartItem.name;
                    const action = isPlus ? 'увеличено' : 'уменьшено';
                    showNotification('Корзина обновлена', `Количество "${itemName}" ${action} до ${newQuantity}`, 'info');
                }
            }
        }
        
        if (target.classList.contains('remove-btn')) {
            const itemId = parseInt(target.getAttribute('data-id') || '0');
            const cartItem = cartManager.getItems().find(item => item.id === itemId);
            
            if (cartItem) {
                customModalManager.showDeleteConfirm((confirmed: boolean) => {
                    if (confirmed) {
                        cartManager.removeItem(itemId);
                        showNotification('Удалено', `"${cartItem.name}" удален из корзины`, 'info');
                    }
                });
            }
        }
    });
    
    // Оформление заказа
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', processOrder);
    }

    // Вход в систему
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;
            
            if (userManager.login(email, password)) {
                modalManager.closeModal('login-modal');
                
                // Показываем кастомное окно успешного входа
                setTimeout(() => {
                    customModalManager.showLoginSuccess(() => {
                        console.log('Пользователь закрыл окно успешного входа');
                    });
                }, 300);
            } else {
                showNotification('Ошибка входа', 'Неверный email или пароль.', 'error');
            }
        });
    }

    const adminOrdersBtn = document.getElementById('admin-orders-btn');
    if (adminOrdersBtn) {
        adminOrdersBtn.addEventListener('click', () => {
            modalManager.openModal('admin-orders-modal');
        });
    }

    // Выход из системы
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            userManager.logout();
            modalManager.closeModal('profile-modal');
            
            // Показываем кастомное окно успешного выхода
            setTimeout(() => {
                customModalManager.showLogoutSuccess(() => {
                    console.log('Пользователь закрыл окно успешного выхода');
                });
            }, 300);
        });
    }

    // Обработка фильтров заказов в админ-панели
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        
        if (target.classList.contains('filter-order-btn')) {
            const status = target.getAttribute('data-status');
            
            // Обновляем активную кнопку
            document.querySelectorAll('.filter-order-btn').forEach(btn => btn.classList.remove('active'));
            target.classList.add('active');
            
            // Загружаем отфильтрованные заказы
            if (status) {
                orderManager.loadAdminOrders(status);
            }
        }
    });

    // Обработка изменения статуса заказа
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        
        if (target.classList.contains('status-btn')) {
            const orderId = parseInt(target.getAttribute('data-order') || '0');
            const action = target.getAttribute('data-action');
            const orderElement = target.closest('.admin-order-item');
            
            if (orderElement && action) {
                const orderNumber = orderElement.querySelector('.admin-order-info strong')?.textContent || 'заказ';
                
                switch (action) {
                    case 'preparing':
                        userManager.updateOrderStatus(orderId, 'preparing');
                        showNotification('Статус обновлен', `${orderNumber} начал готовиться`, 'info');
                        break;
                    case 'ready':
                        userManager.updateOrderStatus(orderId, 'ready');
                        showNotification('Готово', `${orderNumber} готов к выдаче`, 'success');
                        break;
                    case 'completed':
                        userManager.updateOrderStatus(orderId, 'completed');
                        showNotification('Завершено', `${orderNumber} выдан клиенту`, 'success');
                        break;
                    case 'cancelled':
                        customModalManager.showCancelOrderConfirm((confirmed: boolean) => {
                            if (confirmed) {
                                userManager.updateOrderStatus(orderId, 'cancelled');
                                showNotification('Отменено', `${orderNumber} был отменен`, 'warning');
                            }
                        });
                        break;
                    case 'set_time':
                        customModalManager.showSetTimeForm((time: string | false) => {
                            if (time) {
                                userManager.updateOrderStatus(orderId, 'preparing', time);
                                showNotification('Время установлено', `Время готовности ${orderNumber}: ${time}`, 'info');
                            }
                        });
                        break;
                }
                
                // Обновляем список заказов после изменения статуса
                setTimeout(() => {
                    const activeFilter = document.querySelector('.filter-order-btn.active')?.getAttribute('data-status') || 'all';
                    orderManager.loadAdminOrders(activeFilter);
                }, 500);
            }
        }
    });

    // Обработка выбора времени в корзине
    const timeSelect = document.getElementById('order-time') as HTMLSelectElement;
    if (timeSelect) {
        timeSelect.addEventListener('change', () => {
            const selectedTime = timeSelect.value;
            if (selectedTime) {
                showNotification('Время выбрано', `Заказ будет готов к ${selectedTime}`, 'info');
            }
        });
    }

    // Обработка добавления блюд в корзину (через делегирование событий)
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        
        if (target.classList.contains('add-to-cart-btn')) {
            const itemId = parseInt(target.getAttribute('data-id') || '0');
            const item = menuManager.getMenuItemById(itemId);
            
            if (item) {
                cartManager.addItem(item);
            }
        }
    });
}

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let cartManager: CartManager;
let userManager: UserManager;
let menuManager: MenuManager;
let feedbackManager: FeedbackManager;
let modalManager: ModalManager;
let customModalManager: CustomModalManager;
let scrollManager: ScrollManager;
let orderManager: OrderManager;

// ==================== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ====================
async function initializeApp(): Promise<void> {
    console.log('🚀 Initializing SibSIU Canteen Website...');
    
    // Инициализация менеджеров
    cartManager = new CartManager();
    userManager = new UserManager();
    feedbackManager = new FeedbackManager();
    modalManager = new ModalManager();
    orderManager = new OrderManager(userManager);
    
    // Инициализация новых менеджеров
    customModalManager = new CustomModalManager();
    scrollManager = new ScrollManager();

    // Инициализация меню с загрузкой из API
    menuManager = new MenuManager();
    
    setupMobileMenu();
    updateWorkingHours();
    setupEventHandlers();
    setupAdminPanel();
    setupOrderFilters();
    
    // Тестируем API подключение
    try {
        const health = await globalApiClient.request('/health');
        console.log('✅ API health:', health);
    } catch (error) {
        console.log('⚠️ API not available, using localStorage mode');
    }
    
    console.log('✅ Website initialized successfully');
}

// Вспомогательная функция для фильтров заказов (уже объявлена выше, но добавлю для полноты)
function setupOrderFilters(): void {
    const filterButtons = document.querySelectorAll('.filter-order-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.target as HTMLButtonElement;
            const status = target.getAttribute('data-status');
            
            // Обновляем активную кнопку
            filterButtons.forEach(btn => btn.classList.remove('active'));
            target.classList.add('active');
            
            // Загружаем отфильтрованные заказы
            if (status) {
                orderManager.loadAdminOrders(status);
            }
        });
    });
}

// ==================== ЗАПУСК ПРИЛОЖЕНИЯ ====================
document.addEventListener('DOMContentLoaded', initializeApp);

// Инициализация глобального API клиента для window
window.apiClient = globalApiClient;