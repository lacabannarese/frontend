// ==========================================
// INTEGRACIÓN TIENDA - CARRITO
// ==========================================

// Actualizar contador del carrito al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarContadorCarrito();
    
    // Agregar event listeners a todos los botones de "Agregar al carrito"
    const botonesAgregar = document.querySelectorAll('.agregar-carrito');
    
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtener datos del producto desde los atributos data-*
            // IMPORTANTE: data-precio está en CENTAVOS, convertir a pesos
            const producto = {
                id: this.getAttribute('data-id'),
                nombre: this.getAttribute('data-nombre'),
                precio: parseFloat(this.getAttribute('data-precio')) / 100, // Convertir centavos a pesos
                imagen: this.getAttribute('data-imagen')
            };
            
            // Agregar al carrito
            agregarAlCarrito(producto);
            
            // Animación del botón
            animarBotonAgregado(this);
        });
    });
});

// ==========================================
// FUNCIÓN: Actualizar contador del carrito
// ==========================================
function actualizarContadorCarrito() {
    const carritoGuardado = localStorage.getItem('carritoLaCabana');
    let totalItems = 0;
    
    if (carritoGuardado) {
        const carrito = JSON.parse(carritoGuardado);
        totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    }
    
    const badge = document.getElementById('carrito-badge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// ==========================================
// FUNCIÓN: Animar botón cuando se agrega producto
// ==========================================
function animarBotonAgregado(boton) {
    const textoOriginal = boton.innerHTML;
    
    // Cambiar texto y estilo temporalmente
    boton.innerHTML = '✅ Agregado';
    boton.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
    boton.style.transform = 'scale(1.05)';
    
    // Restaurar después de 1.5 segundos
    setTimeout(() => {
        boton.innerHTML = textoOriginal;
        boton.style.background = '';
        boton.style.transform = '';
    }, 1500);
}