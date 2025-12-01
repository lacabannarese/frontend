// ==========================================
// SISTEMA DE GESTIÓN DE COBROS CON STRIPE
// ==========================================

// Configuración de Stripe
const STRIPE_SECRET_KEY = 'sk_test_51SX1KLQadAnOUAEUK3rhGsScgJth90j1U7Ho8qNXGB1tEUYXn9Al39eJRYfrxji7m6VFpUp7hW6CJjOcAddRauCT00bJySZ2c4'; // ⚠️ IMPORTANTE: Reemplaza con tu clave secreta
const STRIPE_API_URL = 'https://api.stripe.com/v1';

// Variables globales
let currentPage = 1;
let allCharges = [];
let filteredCharges = [];

// ==========================================
// FUNCIÓN PRINCIPAL: Cargar cobros desde Stripe
// ==========================================
async function loadChargesFromStripe() {
    try {
        showLoading(true);
        
        // Llamada a la API de Stripe para obtener cobros
        const response = await fetch(`${STRIPE_API_URL}/charges?limit=100`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            throw new Error('Error al conectar con Stripe');
        }

        const data = await response.json();
        allCharges = data.data;
        filteredCharges = allCharges;
        
        // Actualizar estadísticas
        updateStats(allCharges);
        
        // Mostrar cobros en la tabla
        displayCharges(filteredCharges);
        
        showLoading(false);
        
    } catch (error) {
        console.error('Error al cargar cobros:', error);
        showError('No se pudieron cargar los cobros. Verifica tu clave de API de Stripe.');
        showLoading(false);
        
        // Cargar datos de ejemplo para pruebas
        loadMockData();
    }
}

// ==========================================
// FUNCIÓN: Cargar datos de ejemplo (para desarrollo)
// ==========================================
function loadMockData() {
    allCharges = [
        {
            id: 'ch_1234567890abcdef',
            amount: 1299,
            currency: 'mxn',
            status: 'succeeded',
            customer: 'cus_ABC123',
            receipt_email: 'cliente1@ejemplo.com',
            payment_method_details: {
                type: 'card',
                card: { brand: 'visa', last4: '4242' }
            },
            created: Date.now() / 1000 - 86400,
            description: 'Pimienta negra molida',
            billing_details: {
                name: 'Juan Pérez'
            }
        },
        {
            id: 'ch_0987654321fedcba',
            amount: 1599,
            currency: 'mxn',
            status: 'succeeded',
            customer: 'cus_XYZ789',
            receipt_email: 'cliente2@ejemplo.com',
            payment_method_details: {
                type: 'card',
                card: { brand: 'mastercard', last4: '5555' }
            },
            created: Date.now() / 1000 - 172800,
            description: 'Pimienta rosa en grano',
            billing_details: {
                name: 'María González'
            }
        },
        {
            id: 'ch_abcd1234efgh5678',
            amount: 1199,
            currency: 'mxn',
            status: 'pending',
            customer: 'cus_PQR456',
            receipt_email: 'cliente3@ejemplo.com',
            payment_method_details: {
                type: 'card',
                card: { brand: 'amex', last4: '8888' }
            },
            created: Date.now() / 1000 - 3600,
            description: 'Pimienta blanca fina',
            billing_details: {
                name: 'Carlos Ramírez'
            }
        },
        {
            id: 'ch_xyz9876abc4321',
            amount: 1399,
            currency: 'mxn',
            status: 'failed',
            customer: 'cus_LMN321',
            receipt_email: 'cliente4@ejemplo.com',
            payment_method_details: {
                type: 'card',
                card: { brand: 'visa', last4: '1111' }
            },
            created: Date.now() / 1000 - 7200,
            description: 'Pimienta de Jamaica',
            billing_details: {
                name: 'Ana Martínez'
            }
        }
    ];
    
    filteredCharges = allCharges;
    updateStats(allCharges);
    displayCharges(filteredCharges);
}

// ==========================================
// FUNCIÓN: Actualizar estadísticas
// ==========================================
function updateStats(charges) {
    const exitosos = charges.filter(c => c.status === 'succeeded');
    const pendientes = charges.filter(c => c.status === 'pending');
    const fallidos = charges.filter(c => c.status === 'failed');
    
    const totalVentas = exitosos.reduce((sum, c) => sum + c.amount, 0) / 100;
    
    document.getElementById('total-ventas').textContent = `$${totalVentas.toFixed(2)}`;
    document.getElementById('cobros-exitosos').textContent = exitosos.length;
    document.getElementById('cobros-pendientes').textContent = pendientes.length;
    document.getElementById('cobros-fallidos').textContent = fallidos.length;
}

// ==========================================
// FUNCIÓN: Mostrar cobros en la tabla
// ==========================================
function displayCharges(charges) {
    const tbody = document.getElementById('cobros-table-body');
    
    if (charges.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
                    No se encontraron cobros
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    charges.forEach(charge => {
        const row = document.createElement('tr');
        
        // Formatear fecha
        const fecha = new Date(charge.created * 1000).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Estado con badge
        let estadoBadge = '';
        switch(charge.status) {
            case 'succeeded':
                estadoBadge = '<span class="admin-badge admin-badge-success">✅ Exitoso</span>';
                break;
            case 'pending':
                estadoBadge = '<span class="admin-badge admin-badge-warning">⏳ Pendiente</span>';
                break;
            case 'failed':
                estadoBadge = '<span class="admin-badge admin-badge-danger">❌ Fallido</span>';
                break;
            default:
                estadoBadge = `<span class="admin-badge admin-badge-info">${charge.status}</span>`;
        }
        
        // Método de pago
        const metodoPago = charge.payment_method_details ? 
            `${charge.payment_method_details.card.brand.toUpperCase()} •••• ${charge.payment_method_details.card.last4}` : 
            'N/A';
        
        // Cliente
        const nombreCliente = charge.billing_details?.name || 'Cliente Anónimo';
        
        row.innerHTML = `
            <td style="font-family: monospace; color: var(--color-acento);">${charge.id}</td>
            <td><strong>${nombreCliente}</strong></td>
            <td>${charge.receipt_email || 'N/A'}</td>
            <td><strong style="color: var(--color-principal); font-size: 1.1em;">$${(charge.amount / 100).toFixed(2)}</strong></td>
            <td>${estadoBadge}</td>
            <td>${metodoPago}</td>
            <td>${fecha}</td>
            <td>
                <div class="admin-action-buttons">
                    <button class="admin-btn admin-btn-primary admin-btn-small" onclick="viewChargeDetails('${charge.id}')">
                        👁️ Ver
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// ==========================================
// FUNCIÓN: Ver detalles de un cobro
// ==========================================
function viewChargeDetails(chargeId) {
    const charge = allCharges.find(c => c.id === chargeId);
    
    if (!charge) {
        alert('Cobro no encontrado');
        return;
    }
    
    const modal = document.getElementById('cobro-detail-modal');
    const content = document.getElementById('cobro-details-content');
    
    const fecha = new Date(charge.created * 1000).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    content.innerHTML = `
        <div style="padding: 20px;">
            <div style="background: var(--color-item-bg); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="color: var(--color-titulo); margin-bottom: 15px;">📋 Información General</h4>
                <p><strong>ID Transacción:</strong> <code>${charge.id}</code></p>
                <p><strong>Monto:</strong> <span style="font-size: 1.5em; color: var(--color-principal);">$${(charge.amount / 100).toFixed(2)} ${charge.currency.toUpperCase()}</span></p>
                <p><strong>Estado:</strong> ${getStatusBadge(charge.status)}</p>
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p><strong>Descripción:</strong> ${charge.description || 'Sin descripción'}</p>
            </div>
            
            <div style="background: var(--color-item-bg); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="color: var(--color-titulo); margin-bottom: 15px;">👤 Información del Cliente</h4>
                <p><strong>Nombre:</strong> ${charge.billing_details?.name || 'N/A'}</p>
                <p><strong>Email:</strong> ${charge.receipt_email || 'N/A'}</p>
                <p><strong>ID Cliente:</strong> ${charge.customer || 'N/A'}</p>
            </div>
            
            <div style="background: var(--color-item-bg); padding: 20px; border-radius: 10px;">
                <h4 style="color: var(--color-titulo); margin-bottom: 15px;">💳 Método de Pago</h4>
                <p><strong>Tipo:</strong> ${charge.payment_method_details?.type || 'N/A'}</p>
                <p><strong>Tarjeta:</strong> ${charge.payment_method_details?.card.brand.toUpperCase()} •••• ${charge.payment_method_details?.card.last4}</p>
            </div>
            
            <div class="admin-btn-group" style="margin-top: 20px;">
                <button class="admin-btn admin-btn-primary" onclick="window.open('https://dashboard.stripe.com/payments/${charge.id}', '_blank')">
                    Ver en Stripe Dashboard
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// ==========================================
// FUNCIÓN: Obtener badge de estado
// ==========================================
function getStatusBadge(status) {
    switch(status) {
        case 'succeeded':
            return '<span class="admin-badge admin-badge-success">✅ Exitoso</span>';
        case 'pending':
            return '<span class="admin-badge admin-badge-warning">⏳ Pendiente</span>';
        case 'failed':
            return '<span class="admin-badge admin-badge-danger">❌ Fallido</span>';
        default:
            return `<span class="admin-badge admin-badge-info">${status}</span>`;
    }
}

// ==========================================
// FUNCIÓN: Filtrar cobros
// ==========================================
function filterCharges() {
    const searchTerm = document.getElementById('search-cobros').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;
    
    filteredCharges = allCharges.filter(charge => {
        const matchesSearch = 
            charge.id.toLowerCase().includes(searchTerm) ||
            (charge.receipt_email && charge.receipt_email.toLowerCase().includes(searchTerm)) ||
            (charge.billing_details?.name && charge.billing_details.name.toLowerCase().includes(searchTerm));
        
        const matchesStatus = statusFilter === 'all' || charge.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    displayCharges(filteredCharges);
}

// ==========================================
// FUNCIÓN: Mostrar/ocultar loading
// ==========================================
function showLoading(show) {
    const tbody = document.getElementById('cobros-table-body');
    if (show) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <div class="loading-spinner" style="font-size: 1.2em;">⏳ Cargando cobros desde Stripe...</div>
                </td>
            </tr>
        `;
    }
}

// ==========================================
// FUNCIÓN: Mostrar error
// ==========================================
function showError(message) {
    const tbody = document.getElementById('cobros-table-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 40px;">
                <div style="color: #e74c3c; font-size: 1.1em;">
                    ❌ ${message}
                    <br><br>
                    <small style="color: #999;">Mostrando datos de ejemplo para desarrollo</small>
                </div>
            </td>
        </tr>
    `;
}

// ==========================================
// EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Cargar cobros al iniciar
    loadChargesFromStripe();
    
    // Búsqueda en tiempo real
    document.getElementById('search-cobros').addEventListener('input', filterCharges);
    
    // Filtro por estado
    document.getElementById('filter-status').addEventListener('change', filterCharges);
    
    // Cerrar modal
    document.getElementById('close-modal').addEventListener('click', function() {
        document.getElementById('cobro-detail-modal').classList.remove('active');
    });
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('cobro-detail-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
});

// ==========================================
// EXPORTAR FUNCIONES GLOBALES
// ==========================================
window.viewChargeDetails = viewChargeDetails;
window.loadChargesFromStripe = loadChargesFromStripe;
