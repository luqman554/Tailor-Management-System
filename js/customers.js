/**
 * Customer Management Logic
 */

let customers = [];
let filteredCustomers = [];

document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
    initEventListeners();
});

function loadCustomers() {
    customers = Storage.getCustomers();
    filteredCustomers = [...customers];
    renderCustomers();
}

function renderCustomers() {
    const tableBody = document.getElementById('customersTableBody');
    
    if (filteredCustomers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 3rem; color: var(--text-muted);">No customers found</td></tr>';
        return;
    }

    tableBody.innerHTML = filteredCustomers.map(customer => `
        <tr>
            <td data-label="Customer Name">
                <div class="customer-info-cell">
                    <div class="customer-initials">${customer.name.charAt(0)}</div>
                    <div class="customer-name-wrapper">
                        <h4>${customer.name}</h4>
                        <p>${customer.address || 'No address'}</p>
                    </div>
                </div>
            </td>
            <td data-label="Contact Info">
                <div style="font-size: 0.9rem;">
                    <i class="fas fa-phone" style="color: var(--primary-gold); margin-right: 5px;"></i> ${customer.phone}<br>
                    <i class="fab fa-whatsapp" style="color: #25D366; margin-right: 5px;"></i> ${customer.whatsapp || 'N/A'}
                </div>
            </td>
            <td data-label="Gender"><span class="status-badge" style="background: rgba(255,255,255,0.05);">${customer.gender}</span></td>
            <td data-label="Joined Date">${Utils.formatDate(customer.createdAt)}</td>
            <td data-label="Actions">
                <div class="action-btns">
                    <button class="btn-icon" onclick="openEditModal('${customer.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="viewMeasurements('${customer.id}')" title="Measurements">
                        <i class="fas fa-ruler"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteCustomer('${customer.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function initEventListeners() {
    const addBtn = document.getElementById('addCustomerBtn');
    const modal = document.getElementById('customerModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('customerForm');
    const searchInput = document.getElementById('customerSearch');
    const genderFilter = document.getElementById('genderFilter');

    addBtn.onclick = () => {
        form.reset();
        document.getElementById('customerId').value = '';
        document.getElementById('modalTitle').textContent = 'Add New Customer';
        modal.classList.add('active');
    };

    closeBtn.onclick = cancelBtn.onclick = () => {
        modal.classList.remove('active');
    };

    form.onsubmit = (e) => {
        e.preventDefault();
        const customerData = {
            id: document.getElementById('customerId').value,
            name: document.getElementById('fullName').value,
            gender: document.getElementById('gender').value,
            phone: document.getElementById('phone').value,
            whatsapp: document.getElementById('whatsapp').value,
            address: document.getElementById('address').value,
            notes: document.getElementById('notes').value
        };

        Storage.saveCustomer(customerData);
        UI.showNotification(customerData.id ? 'Customer updated successfully' : 'Customer added successfully');
        modal.classList.remove('active');
        loadCustomers();
    };

    searchInput.oninput = Utils.debounce(() => {
        filterCustomers();
    }, 300);

    genderFilter.onchange = () => {
        filterCustomers();
    };
}

function filterCustomers() {
    const query = document.getElementById('customerSearch').value.toLowerCase();
    const gender = document.getElementById('genderFilter').value;

    filteredCustomers = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(query) || 
                              c.phone.includes(query) || 
                              (c.address && c.address.toLowerCase().includes(query));
        const matchesGender = !gender || c.gender === gender;
        return matchesSearch && matchesGender;
    });

    renderCustomers();
}

function openEditModal(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    document.getElementById('customerId').value = customer.id;
    document.getElementById('fullName').value = customer.name;
    document.getElementById('gender').value = customer.gender;
    document.getElementById('phone').value = customer.phone;
    document.getElementById('whatsapp').value = customer.whatsapp || '';
    document.getElementById('address').value = customer.address || '';
    document.getElementById('notes').value = customer.notes || '';

    document.getElementById('modalTitle').textContent = 'Edit Customer';
    document.getElementById('customerModal').classList.add('active');
}

function deleteCustomer(id) {
    if (confirm('Are you sure you want to delete this customer? All related data will be kept but customer record will be removed.')) {
        Storage.deleteCustomer(id);
        UI.showNotification('Customer deleted', 'error');
        loadCustomers();
    }
}

function viewMeasurements(id) {
    window.location.href = `measurements.html?customerId=${id}`;
}
