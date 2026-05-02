/**
 * Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    renderCharts();
});

function loadDashboardData() {
    const customers = Storage.getCustomers();
    const orders = Storage.getOrders();
    
    // Update Stats
    document.getElementById('totalCustomers').textContent = customers.length;
    document.getElementById('totalOrders').textContent = orders.length;
    
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    
    const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
    document.getElementById('totalRevenue').textContent = Utils.formatCurrency(totalRevenue);

    // Render Recent Orders
    renderRecentOrders(orders);
    
    // Render Recent Customers
    renderRecentCustomers(customers);
}

function renderRecentOrders(orders) {
    const tableBody = document.getElementById('recentOrdersTable');
    const recent = orders.slice(-5).reverse(); // Last 5 orders

    if (recent.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--text-muted);">No orders found</td></tr>';
        return;
    }

    tableBody.innerHTML = recent.map(order => `
        <tr>
            <td><strong>#${order.id}</strong></td>
            <td>${order.customerName}</td>
            <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
            <td>${Utils.formatCurrency(order.totalAmount)}</td>
        </tr>
    `).join('');
}

function renderRecentCustomers(customers) {
    const list = document.getElementById('recentCustomersList');
    const recent = customers.slice(-4).reverse();

    if (recent.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding: 1rem; color: var(--text-muted);">No customers found</p>';
        return;
    }

    list.innerHTML = recent.map(customer => `
        <div class="customer-item">
            <img src="https://ui-avatars.com/api/?name=${customer.name}&background=random" class="customer-avatar" alt="${customer.name}">
            <div class="customer-info">
                <h4>${customer.name}</h4>
                <p>${customer.phone}</p>
            </div>
            <div style="margin-left: auto;">
                <span style="font-size: 0.8rem; color: var(--text-muted);">${Utils.formatDate(customer.createdAt)}</span>
            </div>
        </div>
    `).join('');
}

function renderCharts() {
    const ctx = document.getElementById('statusChart').getContext('2d');
    const orders = Storage.getOrders();
    
    const statuses = ['Pending', 'Cutting', 'Stitching', 'Ready', 'Delivered'];
    const data = statuses.map(s => orders.filter(o => o.status === s).length);
    
    // Custom Simple Chart using Canvas if no Chart.js
    // For now, I'll just draw a simple bar chart or use a placeholder if the user wants real charts.
    // The prompt says "Charts using Canvas API". Let's do a simple bar chart.

    const canvas = document.getElementById('statusChart');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = 250;
    const padding = 40;
    
    const maxVal = Math.max(...data, 5);
    const barWidth = (width - (padding * 2)) / statuses.length - 20;

    ctx.clearRect(0, 0, width, height);
    
    statuses.forEach((status, i) => {
        const h = (data[i] / maxVal) * (height - padding * 2);
        const x = padding + i * (barWidth + 20);
        const y = height - padding - h;

        // Draw Bar
        const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
        gradient.addColorStop(0, '#D4AF37');
        gradient.addColorStop(1, '#C5A028');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, h);

        // Draw Label
        ctx.fillStyle = '#A0A0A0';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(status.charAt(0), x + barWidth/2, height - 15);
        
        // Draw Value
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(data[i], x + barWidth/2, y - 10);
    });
}
