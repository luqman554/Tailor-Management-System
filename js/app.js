/**
 * App Module - Main entry point and shared initialization
 */

document.addEventListener('DOMContentLoaded', () => {
    // Apply theme
    const settings = Storage.getSettings();
    UI.setTheme(settings.theme || 'dark');

    // Initialize sidebar
    UI.initSidebar();

    // Global logout handling if any
    const logout = document.getElementById('logoutBtn');
    if (logout) {
        logout.onclick = (e) => {
            e.preventDefault();
            Storage.logout();
            window.location.href = 'index.html';
        };
    }

    // Initialize Tooltips/Dropdowns etc if needed
    console.log('TMS Initialized');
});
