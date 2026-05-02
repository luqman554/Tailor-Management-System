/**
 * Invoice Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    populateOrderDropdown();
    
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    if (orderId) {
        document.getElementById('invoiceOrderSelect').value = orderId;
        renderInvoice(orderId);
    }

    document.getElementById('invoiceOrderSelect').onchange = (e) => {
        if (e.target.value) {
            renderInvoice(e.target.value);
        } else {
            document.getElementById('invoiceContainer').style.display = 'none';
            document.getElementById('noInvoiceSelected').style.display = 'block';
        }
    };
});

function populateOrderDropdown() {
    const orders = Storage.getOrders();
    const select = document.getElementById('invoiceOrderSelect');
    orders.reverse().forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.id;
        opt.textContent = `${o.id} - ${o.customerName}`;
        select.appendChild(opt);
    });
}

function renderInvoice(orderId) {
    const orders = Storage.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const customers = Storage.getCustomers();
    const customer = customers.find(c => c.id === order.customerId);
    const measurements = Storage.getMeasurementByCustomerId(order.customerId);

    document.getElementById('invoiceContainer').style.display = 'block';
    document.getElementById('noInvoiceSelected').style.display = 'none';

    // Set Info
    document.getElementById('invNo').textContent = order.id;
    document.getElementById('invDate').textContent = Utils.formatDate(new Date());
    document.getElementById('invCustName').textContent = order.customerName;
    document.getElementById('invCustPhone').textContent = customer ? customer.phone : 'N/A';
    document.getElementById('invCustAddress').textContent = customer ? (customer.address || 'N/A') : 'N/A';
    document.getElementById('invDueDate').textContent = Utils.formatDate(order.deliveryDate);
    document.getElementById('invStatus').textContent = order.status.toUpperCase();

    // Set Table
    const tableBody = document.getElementById('invItems');
    tableBody.innerHTML = `
        <tr>
            <td>
                <strong>${order.dressType}</strong><br>
                <span style="font-size: 0.8rem; color: #666;">Fabric: ${order.fabric || 'Standard'}, Notes: ${order.notes || 'None'}</span>
            </td>
            <td style="text-align: center;">${order.quantity || 1}</td>
            <td style="text-align: right;">${Utils.formatCurrency(order.totalAmount / (order.quantity || 1))}</td>
            <td style="text-align: right;">${Utils.formatCurrency(order.totalAmount)}</td>
        </tr>
    `;

    // Set Summary
    const total = parseFloat(order.totalAmount) || 0;
    const advance = parseFloat(order.advancePaid) || 0;
    const balance = total - advance;

    document.getElementById('invSubtotal').textContent = Utils.formatCurrency(total);
    document.getElementById('invAdvance').textContent = `-${Utils.formatCurrency(advance)}`;
    document.getElementById('invTotal').textContent = Utils.formatCurrency(balance);

    // Set Measurements
    const measurementsList = document.getElementById('invMeasurementsList');
    if (measurements) {
        document.getElementById('invMeasurementsSection').style.display = 'block';
        const fields = ['neck', 'chest', 'shoulder', 'sleeve', 'waist', 'hip', 'shirtLength', 'trouserLength'];
        measurementsList.innerHTML = fields.map(f => {
            const val = measurements[f];
            if (!val) return '';
            return `<div class="m-item"><strong>${f.charAt(0).toUpperCase() + f.slice(1)}:</strong> ${val}in</div>`;
        }).join('');
    } else {
        document.getElementById('invMeasurementsSection').style.display = 'none';
    }
}
