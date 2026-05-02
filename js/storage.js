/**
 * Storage Module - Handles all LocalStorage interactions
 */

const STORAGE_KEYS = {
    CUSTOMERS: 'tms_customers',
    ORDERS: 'tms_orders',
    MEASUREMENTS: 'tms_measurements',
    SETTINGS: 'tms_settings',
    CURRENT_USER: 'tms_current_user',
    USERS: 'tms_users',
    PAYMENTS: 'tms_payments'
};

const Storage = {
    // Generic methods
    save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    // Customers
    getCustomers() {
        return this.get(STORAGE_KEYS.CUSTOMERS) || [];
    },

    saveCustomer(customer) {
        const customers = this.getCustomers();
        if (customer.id) {
            const index = customers.findIndex(c => c.id === customer.id);
            if (index !== -1) customers[index] = customer;
        } else {
            customer.id = Date.now().toString();
            customer.createdAt = new Date().toISOString();
            customers.push(customer);
        }
        this.save(STORAGE_KEYS.CUSTOMERS, customers);
        return customer;
    },

    deleteCustomer(id) {
        const customers = this.getCustomers().filter(c => c.id !== id);
        this.save(STORAGE_KEYS.CUSTOMERS, customers);
        // Also delete their measurements and orders? 
        // For now, let's just delete the customer.
    },

    // Measurements
    getMeasurements() {
        return this.get(STORAGE_KEYS.MEASUREMENTS) || {};
    },

    saveMeasurement(customerId, measurements) {
        const allMeasurements = this.getMeasurements();
        allMeasurements[customerId] = {
            ...measurements,
            updatedAt: new Date().toISOString()
        };
        this.save(STORAGE_KEYS.MEASUREMENTS, allMeasurements);
    },

    getMeasurementByCustomerId(customerId) {
        return this.getMeasurements()[customerId] || null;
    },

    // Orders
    getOrders() {
        return this.get(STORAGE_KEYS.ORDERS) || [];
    },

    saveOrder(order) {
        const orders = this.getOrders();
        if (order.id) {
            const index = orders.findIndex(o => o.id === order.id);
            if (index !== -1) orders[index] = order;
        } else {
            order.id = 'ORD-' + Date.now().toString().slice(-6);
            order.createdAt = new Date().toISOString();
            orders.push(order);
        }
        this.save(STORAGE_KEYS.ORDERS, orders);
        return order;
    },

    // Settings
    getSettings() {
        const defaultSettings = {
            shopName: 'Elite Tailors',
            currency: 'USD',
            theme: 'dark',
            logo: ''
        };
        return this.get(STORAGE_KEYS.SETTINGS) || defaultSettings;
    },

    saveSettings(settings) {
        this.save(STORAGE_KEYS.SETTINGS, settings);
    },

    // Auth
    getUsers() {
        return this.get(STORAGE_KEYS.USERS) || [{ email: 'admin@tailor.com', password: 'admin123', name: 'Admin' }];
    },

    signup(user) {
        const users = this.getUsers();
        if (users.find(u => u.email === user.email)) {
            return { success: false, message: 'Email already exists' };
        }
        users.push(user);
        this.save(STORAGE_KEYS.USERS, users);
        return { success: true };
    },

    login(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            const sessionUser = { ...user };
            delete sessionUser.password;
            this.save(STORAGE_KEYS.CURRENT_USER, sessionUser);
            return true;
        }
        return false;
    },

    getCurrentUser() {
        return this.get(STORAGE_KEYS.CURRENT_USER);
    },

    logout() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    },

    // Reset Data
    resetAll() {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }
};

window.Storage = Storage; // Make it globally accessible
