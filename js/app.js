"use strict";
// ==================== API КЛИЕНТ ====================
class ApiClient {
    constructor() {
        this.baseUrl = '/api';
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
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
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error('API request failed:', error);
            // Fallback to localStorage
            if (endpoint === '/menu' && options.method === 'GET') {
                console.log('Using localStorage fallback for menu');
                return this.getMenuFromLocalStorage();
            }
            throw error;
        }
    }
    getMenuFromLocalStorage() {
        const saved = localStorage.getItem('menuItems');
        if (saved) {
            return JSON.parse(saved).filter((item) => item.isActive !== false);
        }
        else {
            return [];
        }
    }
    async getMenu(category) {
        const endpoint = category && category !== 'Все'
            ? `/menu?category=${encodeURIComponent(category)}`
            : '/menu';
        return this.request(endpoint);
    }
    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: orderData,
        });
    }
    async getUserProfile(userId) {
        return this.request(`/users/${userId}`);
    }
}
// Создаем глобальный экземпляр ДО использования
const globalApiClient = new ApiClient();
// ==================== МЕНЕДЖЕР КОРЗИНЫ ====================
class CartManager {
    constructor() {
        this.items = [];
        this.loadFromStorage();
        this.updateCartDisplay();
    }
    addItem(item) {
        const existingItem = findItem(this.items, (cartItem) => cartItem.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        }
        else {
            this.items.push({
                ...item,
                quantity: 1
            });
        }
        this.saveToStorage();
        this.updateCartDisplay();
        this.showAddToCartAnimation(item.name);
    }
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveToStorage();
        this.updateCartDisplay();
    }
    updateQuantity(itemId, quantity) {
        const item = findItem(this.items, (cartItem) => cartItem.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId);
            }
            else {
                item.quantity = quantity;
            }
            this.saveToStorage();
            this.updateCartDisplay();
        }
    }
    getTotal() {
        return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
    }
    getItems() {
        return [...this.items];
    }
    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateCartDisplay();
    }
    saveToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }
    loadFromStorage() {
        const saved = localStorage.getItem('cart');
        if (saved) {
            this.items = JSON.parse(saved);
        }
    }
    updateCartDisplay() {
        const cartCount = document.querySelector('.cart-count');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems.toString();
        }
        this.updateCartModal();
    }
    updateCartModal() {
        const cartItems = document.querySelector('.cart-items');
        const totalPrice = document.getElementById('total-price');
        if (cartItems && totalPrice) {
            cartItems.innerHTML = '';
            if (this.items.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
            }
            else {
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
    showAddToCartAnimation(itemName) {
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
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.orders = [];
        this.initializeUsers();
        this.loadCurrentUser();
    }
    initializeUsers() {
        const adminUser = {
            id: 1,
            email: 'admin@sibsiu.ru',
            name: 'Администратор Столовой',
            studentId: 'ADMIN001',
            isAdmin: true
        };
        const testStudent = {
            id: 2,
            email: 'student@sibsiu.ru',
            name: 'Иванов Иван Иванович',
            studentId: '202412345',
            isAdmin: false
        };
        this.users = [adminUser, testStudent];
        this.saveUsersToStorage();
    }
    login(email, password) {
        const user = findItem(this.users, (u) => u.email === email);
        if (user && password === 'password') {
            this.currentUser = user;
            this.saveCurrentUserToStorage();
            this.updateUserDisplay();
            return true;
        }
        return false;
    }
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUserDisplay();
    }
    getCurrentUser() {
        return this.currentUser;
    }
    addOrder(order) {
        this.orders.push(order);
        this.saveOrdersToStorage();
    }
    getOrderHistory(userId) {
        return this.orders.filter(order => order.userId === userId);
    }
    loadCurrentUser() {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            this.currentUser = JSON.parse(saved);
            this.updateUserDisplay();
        }
    }
    saveCurrentUserToStorage() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }
    saveUsersToStorage() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }
    saveOrdersToStorage() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }
    updateUserDisplay() {
        const loginBtn = document.querySelector('.btn-secondary');
        const adminOrdersBtn = document.getElementById('admin-orders-btn');
        if (loginBtn) {
            if (this.currentUser) {
                loginBtn.textContent = 'Личный кабинет';
                loginBtn.classList.add('logged-in');
                // Показываем кнопку управления заказами для админа
                if (adminOrdersBtn && this.currentUser.isAdmin) {
                    adminOrdersBtn.style.display = 'block';
                }
            }
            else {
                loginBtn.textContent = 'Личный кабинет';
                loginBtn.classList.remove('logged-in');
                // Скрываем кнопку админа
                if (adminOrdersBtn) {
                    adminOrdersBtn.style.display = 'none';
                }
            }
        }
    }
    getAllOrders() {
        const saved = localStorage.getItem('orders');
        return saved ? JSON.parse(saved) : [];
    }
    updateOrderStatus(orderId, newStatus, estimatedTime) {
        const orders = this.getAllOrders();
        const orderIndex = findIndex(orders, (order) => order.id === orderId);
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
    getOrdersByStatus(status) {
        const orders = this.getAllOrders();
        return orders.filter((order) => order.status === status);
    }
    getUserOrders(userId) {
        const orders = this.getAllOrders();
        return orders.filter((order) => order.userId === userId);
    }
}
// ==================== МЕНЕДЖЕР МЕНЮ ====================
class MenuManager {
    constructor() {
        this.items = [];
        this.filteredItems = [];
        this.allDishes = [];
        this.loadMenu();
        this.setupFilters();
    }
    async loadMenu() {
        try {
            const menuData = await globalApiClient.getMenu();
            this.items = menuData;
            this.filteredItems = [...this.items];
            localStorage.setItem('menuItems', JSON.stringify(this.items));
        }
        catch (error) {
            console.log('Using localStorage for menu data');
            this.loadMenuFromStorage();
        }
        this.renderMenu();
    }
    loadMenuFromStorage() {
        const saved = localStorage.getItem('menuItems');
        if (saved) {
            this.items = JSON.parse(saved).filter((item) => item.isActive !== false);
        }
        else {
            this.initializeDefaultMenu();
        }
        this.filteredItems = [...this.items];
    }
    initializeDefaultMenu() {
        this.items = [];
        this.allDishes = [...this.items];
        this.saveMenuToStorage();
        this.saveAllDishesToStorage();
    }
    addMenuItem(item) {
        const newItem = {
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
    updateMenuItem(itemId, updates) {
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
    addExistingDish(dishId) {
        const dish = this.allDishes.find(d => d.id === dishId);
        if (dish && !this.isDishActive(dishId)) {
            const activeDish = { ...dish, isActive: true };
            this.items.push(activeDish);
            this.saveMenuToStorage();
            this.filteredItems = [...this.items];
            this.renderMenu();
        }
    }
    removeMenuItem(itemId) {
        const itemIndex = this.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            this.items[itemIndex].isActive = false;
            this.items.splice(itemIndex, 1);
            this.saveMenuToStorage();
            this.filteredItems = [...this.items];
            this.renderMenu();
        }
    }
    getMenuItemById(itemId) {
        return this.allDishes.find(item => item.id === itemId);
    }
    isDishActive(dishId) {
        return this.items.some(item => item.id === dishId);
    }
    generateId() {
        const maxId = Math.max(...this.allDishes.map(dish => dish.id), 0);
        return maxId + 1;
    }
    saveMenuToStorage() {
        localStorage.setItem('menuItems', JSON.stringify(this.items));
    }
    saveAllDishesToStorage() {
        localStorage.setItem('allDishes', JSON.stringify(this.allDishes));
    }
    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const filter = target.textContent?.trim();
                filterButtons.forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');
                this.filterItems(filter || 'Все');
            });
        });
    }
    filterItems(category) {
        if (category === 'Все') {
            this.filteredItems = [...this.items];
        }
        else {
            this.filteredItems = this.items.filter(item => item.category === category);
        }
        this.renderMenu();
    }
    renderMenu() {
        const menuGrid = document.querySelector('.menu-grid');
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
    setupAddToCartHandlers() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const itemId = parseInt(target.getAttribute('data-id') || '0');
                const item = findItem(this.items, (i) => i.id === itemId);
                if (item) {
                    cartManager.addItem(item);
                }
            });
        });
    }
    setupRemoveDishHandlers() {
        const removeButtons = document.querySelectorAll('.remove-dish-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const itemId = parseInt(target.getAttribute('data-id') || '0');
                const item = this.getMenuItemById(itemId);
                if (item) {
                    customModalManager.showDeleteConfirm((confirmed) => {
                        if (confirmed) {
                            this.removeMenuItem(itemId);
                        }
                    });
                }
            });
        });
    }
    setupEditDishHandlers() {
        const editButtons = document.querySelectorAll('.edit-dish-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const itemId = parseInt(target.getAttribute('data-id') || '0');
                this.openEditModal(itemId);
            });
        });
    }
    openEditModal(itemId) {
        const item = this.getMenuItemById(itemId);
        if (!item)
            return;
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
        const closeBtn = editModal.querySelector('.edit-close');
        const cancelBtn = editModal.querySelector('.cancel-edit');
        const form = editModal.querySelector(`#edit-dish-form-${itemId}`);
        const closeModal = () => {
            document.body.removeChild(editModal);
            document.body.style.overflow = 'auto';
        };
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const updates = {
                name: formData.get('name'),
                price: parseInt(formData.get('price')),
                description: formData.get('description'),
                category: formData.get('category'),
                image: formData.get('image'),
                isNew: formData.get('isNew') === 'on'
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
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    getMenuItems() {
        return [...this.items];
    }
    getAllDishes() {
        return [...this.allDishes];
    }
    getInactiveDishes() {
        const activeIds = this.items.map(item => item.id);
        return this.allDishes.filter(dish => !activeIds.includes(dish.id));
    }
    deletePermanent(itemId) {
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
    constructor() {
        this.modals = new SimpleMap();
        this.initializeModals();
        this.setupEventListeners();
    }
    initializeModals() {
        const modalElements = document.querySelectorAll('.modal');
        modalElements.forEach(modal => {
            const id = modal.id;
            this.modals.set(id, modal);
        });
    }
    setupEventListeners() {
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
                }
                else {
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
                this.modals.forEach((modal, id) => {
                    if (e.target === modal) {
                        this.closeModal(id);
                    }
                });
            }
        });
    }
    openModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            this.closeAllModals();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    closeAllModals() {
        this.modals.forEach((modal, id) => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }
    updateProfileModal() {
        const user = userManager.getCurrentUser();
        if (user) {
            const userName = document.getElementById('profile-name');
            const studentId = document.getElementById('profile-student-id');
            const orderHistory = document.getElementById('order-history');
            const adminPanel = document.getElementById('admin-panel');
            if (userName)
                userName.textContent = user.name;
            if (studentId)
                studentId.textContent = user.studentId;
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
    updateAdminPanel() {
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
            }
            else {
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
                    const target = e.target;
                    const dishId = parseInt(target.getAttribute('data-id') || '0');
                    menuManager.addExistingDish(dishId);
                    alert('✅ Блюдо добавлено в меню!');
                    this.updateAdminPanel();
                });
            });
            const deleteButtons = adminPanel.querySelectorAll('.btn-delete-permanent');
            deleteButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const target = e.target;
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
    constructor() {
        this.activeModalId = null;
        this.currentCallback = null;
        this.currentData = null;
        this.setupEventListeners();
        this.setupTimeValidation();
    }
    setupEventListeners() {
        // Обработчики для модалки удаления
        const deleteCancelBtn = document.getElementById('delete-cancel-btn');
        const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
        if (deleteCancelBtn)
            deleteCancelBtn.addEventListener('click', () => this.closeModal(false));
        if (deleteConfirmBtn)
            deleteConfirmBtn.addEventListener('click', () => this.closeModal(true));
        // Обработчики для модалки пустой корзины
        const emptyCartBtn = document.getElementById('empty-cart-ok-btn');
        if (emptyCartBtn)
            emptyCartBtn.addEventListener('click', () => this.closeModal(true));
        // Обработчики для модалки отмены заказа
        const cancelOrderCancelBtn = document.getElementById('cancel-order-cancel-btn');
        const cancelOrderConfirmBtn = document.getElementById('cancel-order-confirm-btn');
        if (cancelOrderCancelBtn)
            cancelOrderCancelBtn.addEventListener('click', () => this.closeModal(false));
        if (cancelOrderConfirmBtn)
            cancelOrderConfirmBtn.addEventListener('click', () => this.closeModal(true));
        // Обработчики для модалки установки времени
        const setTimeCancelBtn = document.getElementById('set-time-cancel-btn');
        if (setTimeCancelBtn)
            setTimeCancelBtn.addEventListener('click', () => this.closeModal(false));
        const setTimeForm = document.getElementById('set-time-form');
        if (setTimeForm) {
            setTimeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const timeInput = document.getElementById('time-input');
                if (this.validateTimeFormat(timeInput.value)) {
                    this.closeModal(timeInput.value);
                }
                else {
                    showNotification('Ошибка', 'Пожалуйста, введите время в правильном формате ЧЧ:ММ (например: 14:30)', 'warning');
                    timeInput.focus();
                }
            });
        }
        // Обработчик для модалки благодарности
        const thankYouBtn = document.getElementById('thank-you-ok-btn');
        if (thankYouBtn)
            thankYouBtn.addEventListener('click', () => this.closeModal(true));
        // Обработчики для модалки входа в систему
        const loginRequiredCancelBtn = document.getElementById('login-required-cancel-btn');
        const loginRequiredLoginBtn = document.getElementById('login-required-login-btn');
        if (loginRequiredCancelBtn)
            loginRequiredCancelBtn.addEventListener('click', () => this.closeModal(false));
        if (loginRequiredLoginBtn)
            loginRequiredLoginBtn.addEventListener('click', () => this.closeModal(true));
        // Обработчики для модалки успешного входа
        const loginSuccessOkBtn = document.getElementById('login-success-ok-btn');
        if (loginSuccessOkBtn)
            loginSuccessOkBtn.addEventListener('click', () => this.closeModal(true));
        // Обработчики для модалки успешного выхода
        const logoutSuccessOkBtn = document.getElementById('logout-success-ok-btn');
        if (logoutSuccessOkBtn)
            logoutSuccessOkBtn.addEventListener('click', () => this.closeModal(true));
        // Обработчики для модалки добавления блюда
        const dishAddedOkBtn = document.getElementById('dish-added-ok-btn');
        if (dishAddedOkBtn)
            dishAddedOkBtn.addEventListener('click', () => this.closeModal(true));
        // Закрытие по клику на оверлей
        document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(false);
                }
            });
        });
    }
    setupTimeValidation() {
        const timeInput = document.getElementById('time-input');
        if (timeInput) {
            timeInput.addEventListener('input', (e) => {
                const input = e.target;
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
                const input = timeInput;
                if (!input.value) {
                    input.value = '14:30';
                    input.select();
                }
            });
            timeInput.addEventListener('blur', () => {
                const input = timeInput;
                if (input.value === '14:30' && !input.hasAttribute('data-changed')) {
                    input.value = '';
                }
            });
            timeInput.addEventListener('input', () => {
                const input = timeInput;
                input.setAttribute('data-changed', 'true');
            });
        }
    }
    validateTimeFormat(time) {
        const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }
    showDeleteConfirm(callback) {
        this.showModal('delete-confirm-modal', callback);
    }
    showEmptyCartAlert(callback) {
        this.showModal('empty-cart-modal', callback);
    }
    showCancelOrderConfirm(callback) {
        this.showModal('cancel-order-modal', callback);
    }
    showSetTimeForm(callback) {
        const timeInput = document.getElementById('time-input');
        if (timeInput) {
            timeInput.value = '';
            timeInput.removeAttribute('data-changed');
        }
        this.showModal('set-time-modal', callback);
    }
    showThankYouModal(callback) {
        this.showModal('thank-you-modal', callback);
    }
    showLoginRequired(callback) {
        this.showModal('login-required-modal', callback);
    }
    showLoginSuccess(callback) {
        this.showModal('login-success-modal', callback);
    }
    showLogoutSuccess(callback) {
        this.showModal('logout-success-modal', callback);
    }
    showDishAdded(callback) {
        this.showModal('dish-added-modal', callback);
    }
    showModal(modalId, callback, data) {
        this.closeActiveModal();
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            this.activeModalId = modalId;
            this.currentCallback = callback;
            this.currentData = data;
            document.body.style.overflow = 'hidden';
        }
    }
    closeModal(result) {
        if (this.activeModalId) {
            const modal = document.getElementById(this.activeModalId);
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
    closeActiveModal() {
        if (this.activeModalId) {
            const modal = document.getElementById(this.activeModalId);
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
    setupScrollButtons() {
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
    setupFooterFilterButtons() {
        const footerLinks = document.querySelectorAll('.footer-links a');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const text = link.textContent?.toLowerCase() || '';
                // Маппинг текста кнопок на категории
                const categoryMap = {
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
                }
                else if (text.includes('контакты')) {
                    this.scrollToSection('contacts');
                }
            });
        });
    }
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const header = document.querySelector('header');
            const headerHeight = header ? header.offsetHeight : 80;
            const offsetTop = section.offsetTop - headerHeight;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }
    activateFilterButton(category) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            if (btn.textContent?.trim() === category) {
                btn.classList.add('active');
                // Триггерим клик для фильтрации
                btn.click();
            }
            else {
                btn.classList.remove('active');
            }
        });
    }
    initializeYandexMap() {
        const mapContainer = document.querySelector('.map');
        if (!mapContainer)
            return;
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
    loadYandexMap() {
        // Проверяем, загружена ли уже карта
        if (window.ymaps) {
            this.initMap();
        }
        else {
            // Загружаем API Яндекс Карт
            const script = document.createElement('script');
            script.src = 'https://api-maps.yandex.ru/2.1/?apikey=НУЖЕН_АПИ_КЛЮЧ&lang=ru_RU';
            script.onload = () => this.initMap();
            document.head.appendChild(script);
        }
    }
    initMap() {
        const ymaps = window.ymaps;
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
    constructor() {
        this.feedbacks = [];
        this.loadFeedbacksFromStorage();
        this.setupFeedbackForm();
        this.setupFeedbackModal();
    }
    loadFeedbacksFromStorage() {
        const saved = localStorage.getItem('feedbacks');
        if (saved) {
            this.feedbacks = JSON.parse(saved);
        }
    }
    setupFeedbackForm() {
        const form = document.getElementById('feedback-modal-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFeedback(form);
            });
        }
    }
    setupFeedbackModal() {
        // Добавляем улучшенный дизайн для модалки обратной связи
        const feedbackModal = document.getElementById('feedback-modal');
        if (feedbackModal) {
            const modalContent = feedbackModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.maxWidth = '500px';
                modalContent.style.padding = '40px';
            }
        }
    }
    handleFeedback(form) {
        const formData = new FormData(form);
        const feedback = {
            id: this.generateFeedbackId(),
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
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
    generateFeedbackId() {
        const maxId = Math.max(...this.feedbacks.map(f => f.id), 0);
        return maxId + 1;
    }
    saveFeedbacksToStorage() {
        localStorage.setItem('feedbacks', JSON.stringify(this.feedbacks));
    }
}
// ==================== МЕНЕДЖЕР ЗАКАЗОВ ====================
class OrderManager {
    constructor(userManager) {
        this.userManager = userManager;
    }
    // Загрузка заказов для админ-панели
    loadAdminOrders(filterStatus = 'all') {
        const ordersList = document.getElementById('admin-orders-list');
        if (!ordersList)
            return;
        const allOrders = this.userManager.getAllOrders();
        // Сортируем по дате (новые сверху)
        const sortedOrders = allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // Фильтруем по статусу
        const filteredOrders = filterStatus === 'all'
            ? sortedOrders
            : sortedOrders.filter((order) => order.status === filterStatus);
        this.renderAdminOrders(ordersList, filteredOrders);
    }
    renderAdminOrders(container, orders) {
        if (orders.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">Заказы не найдены</p>';
            return;
        }
        let ordersHTML = '';
        orders.forEach((order) => {
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
                ''}
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
    renderOrderItems(items) {
        return items.map(item => `
            <div class="order-item-row">
                <span>${item.name}</span>
                <span>${item.quantity} × ${item.price} ₽ = ${item.quantity * item.price} ₽</span>
            </div>
        `).join('');
    }
    renderStatusButtons(currentStatus, orderId) {
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
    getStatusText(status) {
        const statusTexts = {
            'pending': 'Ожидание',
            'preparing': 'Готовится',
            'ready': 'Готов',
            'completed': 'Выполнен',
            'cancelled': 'Отменен'
        };
        return statusTexts[status];
    }
    setupOrderActionHandlers() {
        // Обработчики кнопок смены статуса
        document.querySelectorAll('.status-btn[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const orderId = parseInt(target.getAttribute('data-order') || '0');
                const action = target.getAttribute('data-action');
                this.handleOrderAction(orderId, action);
            });
        });
    }
    handleOrderAction(orderId, action) {
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
                customModalManager.showCancelOrderConfirm((confirmed) => {
                    if (confirmed) {
                        this.userManager.updateOrderStatus(orderId, 'cancelled');
                        this.loadAdminOrders(document.querySelector('.filter-order-btn.active')?.getAttribute('data-status') || 'all');
                    }
                });
                break;
            case 'set_time':
                customModalManager.showSetTimeForm((time) => {
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
    getUserById(userId) {
        const usersStr = localStorage.getItem('users');
        if (usersStr) {
            const users = JSON.parse(usersStr);
            return findItem(users, (user) => user.id === userId);
        }
        return undefined;
    }
    // Обновление отображения заказов пользователя
    updateUserOrderDisplay(userId) {
        const orderHistory = document.getElementById('order-history');
        if (!orderHistory)
            return;
        const userOrders = this.userManager.getUserOrders(userId);
        const sortedOrders = userOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (sortedOrders.length === 0) {
            orderHistory.innerHTML = '<p>История заказов пуста</p>';
            return;
        }
        let ordersHTML = '';
        sortedOrders.forEach((order) => {
            const itemsList = order.items.map(item => `${item.name} (${item.quantity} × ${item.price} ₽)`).join(', ');
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
                ''}
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
function findItem(array, predicate) {
    for (let i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            return array[i];
        }
    }
    return undefined;
}
function findIndex(array, predicate) {
    for (let i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            return i;
        }
    }
    return -1;
}
// Простая реализация Map для совместимости
class SimpleMap {
    constructor() {
        this.items = [];
    }
    set(key, value) {
        const index = findIndex(this.items, (item) => item.key === key);
        if (index !== -1) {
            this.items[index].value = value;
        }
        else {
            this.items.push({ key, value });
        }
    }
    get(key) {
        const item = findItem(this.items, (item) => item.key === key);
        return item ? item.value : undefined;
    }
    has(key) {
        return findIndex(this.items, (item) => item.key === key) !== -1;
    }
    forEach(callback) {
        this.items.forEach(item => callback(item.value, item.key));
    }
}
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
}
function updateWorkingHours() {
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
function showNotification(title, message, type = 'info') {
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
function getNotificationIcon(type) {
    const icons = {
        'success': '✅',
        'warning': '⚠️',
        'error': '❌',
        'info': 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}
function processOrder() {
    try {
        const user = userManager.getCurrentUser();
        if (!user) {
            customModalManager.showLoginRequired((shouldLogin) => {
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
        const timeSelect = document.getElementById('order-time');
        const selectedTime = timeSelect.value;
        if (!selectedTime) {
            showNotification('Внимание', 'Пожалуйста, выберите время получения заказа', 'warning');
            return;
        }
        const total = cartManager.getTotal();
        const orderNumber = 'ORD' + Date.now().toString().slice(-6);
        // Создаем заказ с выбранным временем
        const order = {
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
        }
        else {
            showNotification('Успешно', `Заказ №${orderNumber} оформлен! Открыта страница оплаты.`, 'success');
        }
        // Очищаем корзину
        cartManager.clear();
        modalManager.closeModal('cart-modal');
    }
    catch (error) {
        console.error('Order processing error:', error);
        showNotification('Ошибка', 'Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.', 'error');
    }
}
function setupAdminPanel() {
    const addMenuItemForm = document.getElementById('add-menu-item-form');
    if (addMenuItemForm) {
        addMenuItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(addMenuItemForm);
            // Валидация
            const name = formData.get('name');
            const price = formData.get('price');
            const description = formData.get('description');
            const category = formData.get('category');
            const image = formData.get('image');
            if (!name || !price || !description || !category || !image) {
                showNotification('Ошибка', 'Пожалуйста, заполните все поля', 'warning');
                return;
            }
            if (parseInt(price) <= 0) {
                showNotification('Ошибка', 'Цена должна быть больше 0', 'warning');
                return;
            }
            const newItem = {
                name,
                price: parseInt(price),
                description,
                category,
                image,
                isNew: formData.get('isNew') === 'on'
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
        const target = e.target;
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
                customModalManager.showDeleteConfirm((confirmed) => {
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
function setupEventHandlers() {
    // Обработчики корзины
    document.addEventListener('click', (e) => {
        const target = e.target;
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
                customModalManager.showDeleteConfirm((confirmed) => {
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
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const email = formData.get('email');
            const password = formData.get('password');
            if (userManager.login(email, password)) {
                modalManager.closeModal('login-modal');
                // Показываем кастомное окно успешного входа
                setTimeout(() => {
                    customModalManager.showLoginSuccess(() => {
                        console.log('Пользователь закрыл окно успешного входа');
                    });
                }, 300);
            }
            else {
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
        const target = e.target;
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
        const target = e.target;
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
                        customModalManager.showCancelOrderConfirm((confirmed) => {
                            if (confirmed) {
                                userManager.updateOrderStatus(orderId, 'cancelled');
                                showNotification('Отменено', `${orderNumber} был отменен`, 'warning');
                            }
                        });
                        break;
                    case 'set_time':
                        customModalManager.showSetTimeForm((time) => {
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
    const timeSelect = document.getElementById('order-time');
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
        const target = e.target;
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
let cartManager;
let userManager;
let menuManager;
let feedbackManager;
let modalManager;
let customModalManager;
let scrollManager;
let orderManager;
// ==================== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ====================
async function initializeApp() {
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
    }
    catch (error) {
        console.log('⚠️ API not available, using localStorage mode');
    }
    console.log('✅ Website initialized successfully');
}
// Вспомогательная функция для фильтров заказов (уже объявлена выше, но добавлю для полноты)
function setupOrderFilters() {
    const filterButtons = document.querySelectorAll('.filter-order-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.target;
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
