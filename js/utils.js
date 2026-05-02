/**
 * Utils Module - Helper functions
 */

const Utils = {
    formatCurrency(amount) {
        const settings = window.Storage ? window.Storage.getSettings() : { currency: 'USD' };
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: settings.currency || 'USD',
        }).format(amount);
    },

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

window.Utils = Utils;

/**
 * UI Module - Common UI components and interactions
 */

const UI = {
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type} slide-in`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.replace('slide-in', 'slide-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    },

    initSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const toggle = document.querySelector('.sidebar-toggle');
        if (toggle && sidebar) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }
};

window.UI = UI;
