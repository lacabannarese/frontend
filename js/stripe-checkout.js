// ==========================================
// INTEGRACIÓN STRIPE CHECKOUT - LA CABAÑA
// ==========================================

// ⚠️ IMPORTANTE: Reemplaza con tu clave pública de Stripe
const STRIPE_PUBLIC_KEY = 'pk_test_51SX1KLQadAnOUAEU4tnGglODyZ5M4AOhl1AMfPTPIPhTmqKBy4uAGu4wwL1zk8Jgur5h5jqQk61xGvt196fbMKyx00EK09Lvlb';

// Inicializar Stripe
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// ==========================================
// CONFIGURACIÓN DEL SERVIDOR
// ==========================================
// ⚠️ IMPORTANTE: Esta URL debe apuntar a tu backend
// El backend es necesario para crear la sesión de Stripe de forma segura
const API_URL = 'https://backend-vjgm.onrender.com/api';

// ==========================================
// FUNCIÓN: Comprar ahora con Stripe
// ==========================================
async function comprarAhora(producto) {
    try {
        // Mostrar loading
        mostrarCargando('Preparando pago seguro...');
        
        // Llamar al backend para crear la sesión de Stripe
        const response = await fetch(`${BACKEND_URL}/crear-sesion-pago`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre: producto.nombre,
                precio: producto.precio, // Precio en centavos
                descripcion: producto.descripcion,
                cantidad: 1
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al crear la sesión de pago');
        }
        
        const session = await response.json();
        
        // Redirigir a Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });
        
        if (result.error) {
            ocultarCargando();
            mostrarError(result.error.message);
        }
        
    } catch (error) {
        ocultarCargando();
        console.error('Error:', error);
        
        // Si no hay backend configurado, mostrar demo
        mostrarDemoStripe(producto);
    }
}

// ==========================================
// FUNCIÓN: Demo de Stripe (sin backend)
// ==========================================
function mostrarDemoStripe(producto) {
    const precioMXN = (producto.precio / 100).toFixed(2);
    
    const mensaje = `
╔════════════════════════════════════════╗
║   DEMO: STRIPE CHECKOUT               ║
╚════════════════════════════════════════╝

📦 Producto: ${producto.nombre}
💰 Precio: $${precioMXN} MXN

⚠️ MODO DEMO ACTIVO

Para activar pagos reales:

1. Configura tu backend (Node.js/PHP/Python)
2. Agrega tu clave pública de Stripe
3. El backend creará la sesión de pago
4. Stripe procesará el pago de forma segura

Ver archivo: STRIPE-BACKEND-SETUP.md

En producción, aquí se abriría Stripe Checkout.
    `.trim();
    
    alert(mensaje);
    
    // Abrir la documentación de Stripe
    const abrirDocs = confirm('¿Quieres ver la documentación de Stripe Checkout?');
    if (abrirDocs) {
        window.open('https://stripe.com/docs/payments/checkout', '_blank');
    }
}

// ==========================================
// FUNCIÓN: Mostrar loading
// ==========================================
function mostrarCargando(mensaje = 'Procesando...') {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
    `;
    
    overlay.innerHTML = `
        <div style="
            background: white;
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        ">
            <div style="
                font-size: 3em;
                margin-bottom: 20px;
                animation: spin 1s linear infinite;
            ">⚡</div>
            <p style="
                font-size: 1.2em;
                color: #333;
                font-weight: bold;
            ">${mensaje}</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Agregar animación de spin
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// FUNCIÓN: Ocultar loading
// ==========================================
function ocultarCargando() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// ==========================================
// FUNCIÓN: Mostrar error
// ==========================================
function mostrarError(mensaje) {
    alert(`❌ Error: ${mensaje}`);
}

// ==========================================
// EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Agregar event listeners a todos los botones "Comprar Ahora"
    const botonesComprar = document.querySelectorAll('.button-comprar-ahora');
    
    botonesComprar.forEach(boton => {
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtener datos del producto
            const producto = {
                nombre: this.getAttribute('data-nombre'),
                precio: parseInt(this.getAttribute('data-precio')), // Precio en centavos
                descripcion: this.getAttribute('data-descripcion')
            };
            
            // Iniciar compra con Stripe
            comprarAhora(producto);
        });
    });
});

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================
window.comprarAhora = comprarAhora;