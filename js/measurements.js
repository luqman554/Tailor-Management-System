/**
 * Measurements Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    populateCustomerSelect();
    initEventListeners();
    
    // Check for customer ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const customerId = urlParams.get('customerId');
    if (customerId) {
        const select = document.getElementById('customerSelect');
        select.value = customerId;
        loadCustomerMeasurements(customerId);
    }
});

function populateCustomerSelect() {
    const customers = Storage.getCustomers();
    const select = document.getElementById('customerSelect');
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = `${customer.name} (${customer.phone})`;
        select.appendChild(option);
    });
}

function initEventListeners() {
    const select = document.getElementById('customerSelect');
    const saveBtn = document.getElementById('saveMeasurementsBtn');

    select.onchange = () => {
        const customerId = select.value;
        if (customerId) {
            loadCustomerMeasurements(customerId);
        } else {
            document.getElementById('measurementsForm').style.display = 'none';
            document.getElementById('noCustomerSelected').style.display = 'block';
        }
    };

    saveBtn.onclick = () => {
        const customerId = select.value;
        if (!customerId) {
            UI.showNotification('Please select a customer first', 'error');
            return;
        }

        const measurements = {};
        const inputs = document.querySelectorAll('#measurementsForm input');
        inputs.forEach(input => {
            measurements[input.name] = input.value;
        });

        Storage.saveMeasurement(customerId, measurements);
        UI.showNotification('Measurements saved successfully');
    };
}

function loadCustomerMeasurements(customerId) {
    const measurements = Storage.getMeasurementByCustomerId(customerId);
    const form = document.getElementById('measurementsForm');
    const placeholder = document.getElementById('noCustomerSelected');
    
    form.style.display = 'block';
    placeholder.style.display = 'none';

    // Clear previous or fill existing
    const inputs = document.querySelectorAll('#measurementsForm input');
    inputs.forEach(input => {
        input.value = measurements ? (measurements[input.name] || '') : '';
    });
}
