// Sistema para cargar y mostrar recetas favoritas del usuario
// ===========================================================

class CargarFavoritos {
    constructor() {
     const API_URL = 'https://backend-vjgm.onrender.com/api';
     const API_BASE = 'https://backend-vjgm.onrender.com';
        this.grid = null;
        this.init();
    }

    // Inicializar
    init() {
        this.grid = document.getElementById('favoritos-grid');
        if (this.grid) {
            this.cargarFavoritosUsuario();
        }
    }

    // Cargar favoritos del usuario
    async cargarFavoritosUsuario() {
        if (!this.grid) {
            console.error('❌ Grid de favoritos no encontrado');
            return;
        }

        // Mostrar loading
        this.mostrarLoading();

        // Verificar sesión
        const session = localStorage.getItem('userSession');
        if (!session) {
            this.mostrarMensajeSinSesion();
            return;
        }

        try {
            const user = JSON.parse(session);
            console.log('👤 Cargando favoritos de:', user.nombreUsuario);

            const response = await fetch(`${this.API_URL}/usuarios/${user.nombreUsuario}/favoritos`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const favoritos = await response.json();
            console.log(`✅ ${favoritos.length} favoritos obtenidos:`, favoritos);

            if (!Array.isArray(favoritos) || favoritos.length === 0) {
                this.mostrarMensajeSinFavoritos();
                return;
            }

            // Renderizar favoritos
            this.renderizarFavoritos(favoritos);

            // Inicializar sistema de favoritos para los iconos
            if (window.favoritosSystem) {
                setTimeout(() => {
                    window.favoritosSystem.setupBookmarks();
                }, 100);
            }

        } catch (error) {
            console.error('❌ Error cargando favoritos:', error);
            this.mostrarError(error.message);
        }
    }

    // Mostrar loading
    mostrarLoading() {
        this.grid.innerHTML = `
            <div style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                <div style="display: inline-block; width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #4CAF50; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 1rem; font-size: 1.1rem; color: #666;">⏳ Cargando tus recetas favoritas...</p>
            </div>
        `;

        // Agregar animación de spinner si no existe
        if (!document.getElementById('spinnerStyle')) {
            const style = document.createElement('style');
            style.id = 'spinnerStyle';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Mostrar mensaje sin sesión
    mostrarMensajeSinSesion() {
        this.grid.innerHTML = `
            <div style="text-align: center; padding: 3rem; grid-column: 1/-1; background: #fff3cd; border-radius: 10px; margin: 2rem;">
                <img src="img/logo.png" alt="Login" style="width: 80px; margin-bottom: 1rem; opacity: 0.8;">
                <h2 style="color: #856404; margin-bottom: 0.5rem;">⚠️ Debes iniciar sesión</h2>
                <p style="font-size: 1.1rem; color: #856404; margin-bottom: 1.5rem;">
                    Para ver tus recetas favoritas necesitas tener una cuenta
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="login.html" style="display: inline-block; padding: 0.8rem 2rem; background: #4CAF50; color: white; text-decoration: none; border-radius: 25px; font-weight: 500; transition: all 0.3s;">
                        🔐 Iniciar Sesión
                    </a>
                    <a href="Registro.html" style="display: inline-block; padding: 0.8rem 2rem; background: #2196F3; color: white; text-decoration: none; border-radius: 25px; font-weight: 500; transition: all 0.3s;">
                        📝 Crear Cuenta
                    </a>
                </div>
            </div>
        `;
    }

    // Mostrar mensaje sin favoritos
    mostrarMensajeSinFavoritos() {
        this.grid.innerHTML = `
            <div style="text-align: center; padding: 3rem; grid-column: 1/-1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; margin: 2rem; color: white;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">💔</div>
                <h2 style="margin-bottom: 0.5rem; font-size: 1.8rem;">No tienes recetas favoritas aún</h2>
                <p style="font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.9;">
                    ¡Explora nuestras deliciosas recetas y guarda tus favoritas!
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="Recetas.html" style="display: inline-block; padding: 0.8rem 2rem; background: white; color: #667eea; text-decoration: none; border-radius: 25px; font-weight: 500; transition: all 0.3s;">
                        🍽️ Explorar Recetas
                    </a>
                    <a href="Desayunos.html" style="display: inline-block; padding: 0.8rem 2rem; background: rgba(255,255,255,0.2); color: white; text-decoration: none; border-radius: 25px; font-weight: 500; border: 2px solid white; transition: all 0.3s;">
                        🌅 Ver Desayunos
                    </a>
                </div>
            </div>
        `;
    }

    // Mostrar error
    mostrarError(mensaje) {
        this.grid.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #d32f2f; background: #ffebee; border-radius: 8px; margin: 2rem; grid-column: 1/-1;">
                <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">❌ Error al cargar favoritos</p>
                <p style="font-size: 0.9rem; color: #666;">${mensaje}</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.6rem 1.2rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.95rem;">
                    🔄 Reintentar
                </button>
            </div>
        `;
    }

    // Renderizar favoritos
    renderizarFavoritos(favoritos) {
        this.grid.innerHTML = favoritos.map(receta => {
            // Construir URL de imagen
            let imagenURL = 'img/carne.jpg';
            if (receta.imagen?.almacenadoEn) {
                imagenURL = receta.imagen.almacenadoEn.startsWith('http')
                    ? receta.imagen.almacenadoEn
                    : `${this.API_BASE}${receta.imagen.almacenadoEn}`;
            }

            return `
                <article class="menu-item" data-receta-id="${receta._id}">
                    <div class="item-image-container">
                        <img src="${imagenURL}" 
                             alt="${this.escapeHtml(receta.titulo)}" 
                             class="item-image"
                             onerror="this.src='img/carne.jpg';">
                    </div>
                    <div class="item-details-block">
                        <div class="item-text">
                            <h2>${this.escapeHtml(receta.titulo)}</h2>
                            ${receta.tipo ? `<p class="recipe-type">🍽️ ${this.escapeHtml(receta.tipo)}</p>` : ''}
                            <p>${this.escapeHtml(this.truncate(receta.descripcion || 'Sin descripción', 140))}</p>
                            ${receta.usuario ? `<p class="recipe-author">👤 Por: ${this.escapeHtml(receta.usuario)}</p>` : ''}
                        </div>
                        <div class="item-bottom">
                            <div class="rating-stars">${this.renderStars(receta.rating || 0)}</div>
                            <img src="img/guardar.png" 
                                 alt="Quitar de favoritos" 
                                 class="bookmark-icon bookmarked" 
                                 title="Quitar de favoritos"
                                 style="filter: brightness(0) saturate(100%) invert(71%) sepia(63%) saturate(2234%) hue-rotate(2deg) brightness(104%) contrast(101%);">
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        console.log('✅ Favoritos renderizados correctamente');
    }

    // Helpers
    escapeHtml(str) {
        if (!str) return "";
        return String(str).replace(/[&<>"']/g, s => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[s]));
    }

    truncate(text, n) {
        if (!text) return "";
        return text.length > n ? text.slice(0, n - 1) + "…" : text;
    }

    renderStars(rating) {
        const r = Math.round(rating || 0);
        const filled = "★".repeat(r);
        const empty = "☆".repeat(5 - r);
        return filled + empty;
    }

    // Recargar favoritos (útil después de eliminar uno)
    async recargar() {
        await this.cargarFavoritosUsuario();
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cargarFavoritosInstance = new CargarFavoritos();
    });
} else {
    window.cargarFavoritosInstance = new CargarFavoritos();
}

// Exportar para uso global
window.CargarFavoritos = CargarFavoritos;