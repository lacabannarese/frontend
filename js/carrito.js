// ==========================================
// SISTEMA DE CARRITO DE COMPRAS - LA CABAÑA
// ==========================================

// Variables globales
let carrito = [];
const COSTO_ENVIO = 50.00;
const IVA_PORCENTAJE = 0.16;

// ==========================================
// FUNCIÓN: Cargar carrito desde localStorage
// ==========================================
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carritoLaCabana');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
    actualizarCarrito();
}

// ==========================================
// FUNCIÓN: Guardar carrito en localStorage
// ==========================================
function guardarCarrito() {
    localStorage.setItem('carritoLaCabana', JSON.stringify(carrito));
}

// ==========================================
// FUNCIÓN: Agregar producto al carrito
// ==========================================
function agregarAlCarrito(producto) {
    // Verificar si el producto ya existe en el carrito
    const productoExistente = carrito.find(item => item.id === producto.id);
    
    if (productoExistente) {
        // Si existe, incrementar cantidad
        productoExistente.cantidad++;
    } else {
        // Si no existe, agregar nuevo producto
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        });
    }
    
    guardarCarrito();
    mostrarNotificacion('✅ Producto agregado al carrito', 'success');
    actualizarContadorCarrito();
}

// ==========================================
// FUNCIÓN: Eliminar producto del carrito
// ==========================================
function eliminarDelCarrito(productId) {
    carrito = carrito.filter(item => item.id !== productId);
    guardarCarrito();
    actualizarCarrito();
    mostrarNotificacion('🗑️ Producto eliminado del carrito', 'info');
}

// ==========================================
// FUNCIÓN: Actualizar cantidad de producto
// ==========================================
function actualizarCantidad(productId, nuevaCantidad) {
    const producto = carrito.find(item => item.id === productId);
    
    if (producto) {
        // No permitir que la cantidad sea menor a 1
        if (nuevaCantidad < 1) {
            mostrarNotificacion('⚠️ Usa el botón de eliminar para quitar el producto', 'warning');
            return;
        }
        
        producto.cantidad = nuevaCantidad;
        guardarCarrito();
        actualizarCarrito();
    }
}

// ==========================================
// FUNCIÓN: Actualizar vista del carrito
// ==========================================
function actualizarCarrito() {
    const carritoVacio = document.getElementById('carrito-vacio');
    const carritoContenido = document.getElementById('carrito-contenido');
    const productosLista = document.getElementById('productos-lista');
    
    // Verificar si el carrito está vacío
    if (carrito.length === 0) {
        carritoVacio.style.display = 'flex';
        carritoContenido.style.display = 'none';
        return;
    }
    
    carritoVacio.style.display = 'none';
    carritoContenido.style.display = 'block';
    
    // Actualizar contador de productos
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    document.getElementById('items-count').textContent = `${totalItems} producto${totalItems !== 1 ? 's' : ''}`;
    
    // Limpiar lista de productos
    productosLista.innerHTML = '';
    
    // Renderizar cada producto
    carrito.forEach(producto => {
        const productoElement = crearElementoProducto(producto);
        productosLista.appendChild(productoElement);
    });
    
    // Actualizar totales
    calcularTotales();
}

// ==========================================
// FUNCIÓN: Crear elemento HTML de producto
// ==========================================
function crearElementoProducto(producto) {
    const div = document.createElement('div');
    div.className = 'producto-carrito';
    
    // Deshabilitar botón "-" si la cantidad es 1
    const botonMenosDeshabilitado = producto.cantidad === 1 ? 'disabled' : '';
    const estiloBotonMenos = producto.cantidad === 1 ? 
        'opacity: 0.4; cursor: not-allowed;' : '';
    
    div.innerHTML = `
        <div class="producto-imagen">
            <img src="${producto.imagen}" alt="${producto.nombre}">
        </div>
        
        <div class="producto-info">
            <h4>${producto.nombre}</h4>
            <p class="producto-precio">$${producto.precio.toFixed(2)}</p>
        </div>
        
        <div class="producto-cantidad">
            <button class="btn-cantidad" 
                    onclick="actualizarCantidad('${producto.id}', ${producto.cantidad - 1})"
                    ${botonMenosDeshabilitado}
                    style="${estiloBotonMenos}"
                    title="${producto.cantidad === 1 ? 'Usa el botón de eliminar para quitar el producto' : 'Disminuir cantidad'}">
                −
            </button>
            <input type="number" value="${producto.cantidad}" min="1" 
                   onchange="actualizarCantidad('${producto.id}', parseInt(this.value))"
                   class="cantidad-input">
            <button class="btn-cantidad" 
                    onclick="actualizarCantidad('${producto.id}', ${producto.cantidad + 1})"
                    title="Aumentar cantidad">
                +
            </button>
        </div>
        
        <div class="producto-subtotal">
            <p class="subtotal-label">Subtotal:</p>
            <p class="subtotal-precio">$${(producto.precio * producto.cantidad).toFixed(2)}</p>
        </div>
        
        <div class="producto-acciones">
            <button class="btn-eliminar" onclick="eliminarDelCarrito('${producto.id}')" title="Eliminar producto">
                🗑️
            </button>
        </div>
    `;
    
    return div;
}

// ==========================================
// FUNCIÓN: Calcular totales
// ==========================================
function calcularTotales() {
    // Calcular subtotal
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    // Calcular IVA
    const iva = subtotal * IVA_PORCENTAJE;
    
    // Calcular total (incluye envío)
    const total = subtotal + COSTO_ENVIO + iva;
    
    // Actualizar en la interfaz
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('envio').textContent = `$${COSTO_ENVIO.toFixed(2)}`;
    document.getElementById('iva').textContent = `$${iva.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// ==========================================
// FUNCIÓN: Actualizar contador en el header (opcional)
// ==========================================
function actualizarContadorCarrito() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    // Si existe un badge de carrito en el header, actualizarlo
    const badge = document.getElementById('carrito-badge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// ==========================================
// FUNCIÓN: Mostrar notificación
// ==========================================
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notification notification-${tipo} show`;
    notificacion.textContent = mensaje;
    
    // Estilos base de la notificación
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        font-size: 1em;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        max-width: 350px;
    `;
    
    // Colores según el tipo
    if (tipo === 'success') {
        notificacion.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
        notificacion.style.color = 'white';
    } else if (tipo === 'error') {
        notificacion.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
        notificacion.style.color = 'white';
    } else if (tipo === 'warning') {
        notificacion.style.background = 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
        notificacion.style.color = 'white';
    } else if (tipo === 'info') {
        notificacion.style.background = 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
        notificacion.style.color = 'white';
    }
    
    // Agregar al body
    document.body.appendChild(notificacion);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

// ==========================================
// FUNCIÓN: Aplicar cupón de descuento
// ==========================================
function aplicarCupon() {
    const cuponInput = document.getElementById('cupon-input');
    const cuponMensaje = document.getElementById('cupon-mensaje');
    const codigoCupon = cuponInput.value.trim().toUpperCase();
    
    // Cupones válidos (puedes expandir esto)
    const cupones = {
        'LACABANA10': { descuento: 0.10, tipo: 'porcentaje' },
        'PRIMERACOMPRA': { descuento: 0.15, tipo: 'porcentaje' },
        'ENVIOGRATIS': { descuento: COSTO_ENVIO, tipo: 'fijo' }
    };
    
    if (cupones[codigoCupon]) {
        const cupon = cupones[codigoCupon];
        cuponMensaje.innerHTML = `<span style="color: green;">✅ Cupón aplicado: ${cupon.descuento * 100}% de descuento</span>`;
        cuponMensaje.style.display = 'block';
        
        // Aquí puedes aplicar el descuento real
        mostrarNotificacion('🎉 Cupón aplicado correctamente', 'success');
    } else {
        cuponMensaje.innerHTML = '<span style="color: red;">❌ Cupón inválido</span>';
        cuponMensaje.style.display = 'block';
        mostrarNotificacion('❌ Cupón inválido', 'error');
    }
}

// ==========================================
// FUNCIÓN: Proceder al pago
// ==========================================
function procederAlPago() {
    if (carrito.length === 0) {
        mostrarNotificacion('❌ El carrito está vacío', 'error');
        return;
    }
    
    // Aquí se integraría con Stripe Checkout
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0) + COSTO_ENVIO;
    
    // Por ahora, mostrar confirmación
    const confirmacion = confirm(
        `¿Deseas proceder al pago?\n\n` +
        `Total a pagar: $${total.toFixed(2)}\n\n` +
        `Serás redirigido a la pasarela de pago segura.`
    );
    
    if (confirmacion) {
        mostrarNotificacion('🔄 Redirigiendo a Stripe Checkout...', 'info');
        
        // Simular redirección (aquí iría la integración real con Stripe)
        setTimeout(() => {
            // window.location.href = 'checkout.html'; // Página de pago
            alert('Integración con Stripe Checkout en desarrollo.\n\nEn producción, aquí se abriría la pasarela de pago.');
        }, 1500);
    }
}

// ==========================================
// FUNCIÓN: Vaciar carrito
// ==========================================
function vaciarCarrito() {
    const confirmacion = confirm('¿Estás seguro de que deseas vaciar el carrito?');
    
    if (confirmacion) {
        carrito = [];
        guardarCarrito();
        actualizarCarrito();
        mostrarNotificación('🗑️ Carrito vaciado', 'info');
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Cargar carrito al iniciar
    cargarCarrito();
    
    // Botón de proceder al pago
    const btnPagar = document.getElementById('btn-pagar');
    if (btnPagar) {
        btnPagar.addEventListener('click', procederAlPago);
    }
    
    // Botón de aplicar cupón
    const btnAplicarCupon = document.getElementById('btn-aplicar-cupon');
    if (btnAplicarCupon) {
        btnAplicarCupon.addEventListener('click', aplicarCupon);
    }
    
    // Enter en input de cupón
    const cuponInput = document.getElementById('cupon-input');
    if (cuponInput) {
        cuponInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                aplicarCupon();
            }
        });
    }
});

// ==========================================
// EXPORTAR FUNCIONES GLOBALES
// ==========================================
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.actualizarCantidad = actualizarCantidad;
window.vaciarCarrito = vaciarCarrito;
window.procederAlPago = procederAlPago;