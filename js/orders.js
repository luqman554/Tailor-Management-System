/**
 * Order Management Logic
 */

let orders = [];
let filteredOrders = [];

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    populateCustomerDropdown();
    initEventListeners();
});

function loadOrders() {
    orders = Storage.getOrders();
    filteredOrders = [...orders];
    updateStats();
    renderOrders();
}

function updateStats() {
    document.getElementById('countPending').textContent = orders.filter(o => o.status === 'Pending').length;
    document.getElementById('countProcessing').textContent = orders.filter(o => ['Cutting', 'Stitching'].includes(o.status)).length;
    document.getElementById('countCompleted').textContent = orders.filter(o => ['Ready', 'Delivered'].includes(o.status)).length;
}

function renderOrders() {
    const list = document.getElementById('ordersList');
    
    if (filteredOrders.length === 0) {
        list.innerHTML = '<div class="card" style="grid-column: 1/-1; text-align: center; padding: 5rem; color: var(--text-muted);">No orders found matching filters</div>';
        return;
    }

    list.innerHTML = filteredOrders.reverse().map(order => {
        const remaining = order.totalAmount - order.advancePaid;
        const paymentClass = remaining <= 0 ? 'paid' : (order.advancePaid > 0 ? 'partial' : 'pending');
        const paymentText = remaining <= 0 ? 'Fully Paid' : (order.advancePaid > 0 ? `Partial (${Utils.formatCurrency(remaining)} left)` : 'Unpaid');

        return `
            <div class="card order-card slide-in">
                <div class="order-card-header">
                    <span class="order-id">#${order.id}</span>
                    <span class="priority-tag priority-${order.priority}">${order.priority}</span>
                </div>
                <h3 class="order-customer-name">${order.customerName}</h3>
                <p class="order-dress-type">${order.dressType} - ${order.fabric || 'Standard Fabric'}</p>
                
                <div class="order-details">
                    <div class="detail-item">
                        <label>Delivery Date</label>
                        <span>${Utils.formatDate(order.deliveryDate)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Current Status</label>
                        <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                </div>

                <div class="order-footer">
                    <div class="payment-info">
                        <span class="payment-status payment-${paymentClass}">${paymentText}</span>
                    </div>
                    <div class="action-btns">
                        <button class="btn-icon" onclick="openInvoice('${order.id}')" title="Generate Invoice">
                            <i class="fas fa-file-invoice"></i>
                        </button>
                        <button class="btn-icon" onclick="updateStatus('${order.id}')" title="Update Status">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteOrder('${order.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function populateCustomerDropdown() {
    const customers = Storage.getCustomers();
    const select = document.getElementById('orderCustomer');
    customers.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.dataset.name = c.name;
        opt.textContent = c.name;
        select.appendChild(opt);
    });
}

function initEventListeners() {
    const addBtn = document.getElementById('addOrderBtn');
    const modal = document.getElementById('orderModal');
    const form = document.getElementById('orderForm');
    
    addBtn.onclick = () => {
        form.reset();
        document.getElementById('orderId').value = '';
        document.getElementById('orderModalTitle').textContent = 'Create New Order';
        modal.classList.add('active');
    };

    document.getElementById('closeOrderModal').onclick = 
    document.getElementById('cancelOrderBtn').onclick = () => {
        modal.classList.remove('active');
    };

    form.onsubmit = (e) => {
        e.preventDefault();
        const customerSelect = document.getElementById('orderCustomer');
        const selectedOption = customerSelect.options[customerSelect.selectedIndex];

        const orderData = {
            id: document.getElementById('orderId').value,
            customerId: customerSelect.value,
            customerName: selectedOption.dataset.name,
            dressType: document.getElementById('dressType').value,
            fabric: document.getElementById('fabric').value,
            quantity: document.getElementById('quantity').value,
            trialDate: document.getElementById('trialDate').value,
            deliveryDate: document.getElementById('deliveryDate').value,
            priority: document.getElementById('priority').value,
            status: document.getElementById('orderStatus').value,
            totalAmount: document.getElementById('totalAmount').value,
            advancePaid: document.getElementById('advancePaid').value,
            notes: document.getElementById('orderNotes').value
        };

        Storage.saveOrder(orderData);
        UI.showNotification('Order saved successfully');
        modal.classList.remove('active');
        loadOrders();
    };

    // Filters
    ['orderSearch', 'statusFilter', 'priorityFilter'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            filterOrders();
        });
    });
}

function filterOrders() {
    const query = document.getElementById('orderSearch').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const priority = document.getElementById('priorityFilter').value;

    filteredOrders = orders.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(query) || o.customerName.toLowerCase().includes(query);
        const matchesStatus = !status || o.status === status;
        const matchesPriority = !priority || o.priority === priority;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    renderOrders();
}

function updateStatus(id) {
    const order = orders.find(o => o.id === id);
    const statuses = ['Pending', 'Cutting', 'Stitching', 'Ready', 'Delivered'];
    const currentIndex = statuses.indexOf(order.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    
    order.status = statuses[nextIndex];
    Storage.saveOrder(order);
    UI.showNotification(`Status updated to ${order.status}`);
    loadOrders();
}

function deleteOrder(id) {
    if (confirm('Delete this order?')) {
        const allOrders = Storage.getOrders().filter(o => o.id !== id);
        Storage.save('tms_orders', allOrders);
        UI.showNotification('Order deleted', 'error');
        loadOrders();
    }
}

function openInvoice(id) {
    window.location.href = `invoices.html?orderId=${id}`;
}
