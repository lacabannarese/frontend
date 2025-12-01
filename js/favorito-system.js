// Sistema de Favoritos - La Cabaña (con API)
// ==========================================

class FavoritosSystem {
    constructor() {
        this.API_URL = 'https://backend-vjgm.onrender.com/api';
        this.API_BASE = 'https://backend-vjgm.onrender.com';
        this.favoritos = new Set(); // Cache local de IDs de recetas favoritas
        this.init();
    }

    // Inicializar el sistema
    async init() {
        await this.cargarFavoritos();
        this.setupBookmarks();
        console.log('✅ Sistema de favoritos inicializado');
    }

    // Cargar favoritos del usuario desde la API
    async cargarFavoritos() {
        const session = localStorage.getItem('userSession');
        if (!session) {
            console.log('ℹ️ Usuario no autenticado, no se cargan favoritos');
            return;
        }

        try {
            const user = JSON.parse(session);
            const response = await fetch(`${this.API_URL}/usuarios/${user.nombreUsuario}`);
            
            if (!response.ok) throw new Error('Error al cargar usuario');
            
            const usuario = await response.json();
            
            // Guardar IDs de recetas favoritas
            if (usuario.favoritos && Array.isArray(usuario.favoritos)) {
                this.favoritos = new Set(usuario.favoritos.map(f => f.toString()));
                console.log(`✅ ${this.favoritos.size} favoritos cargados`);
            }
            
        } catch (error) {
            console.error('❌ Error cargando favoritos:', error);
        }
    }

    // Obtener título de la receta desde un elemento
    obtenerTituloReceta(element) {
        const h2 = element.querySelector('h2');
        return h2 ? h2.textContent.trim() : null;
    }

    // Obtener ID de la receta por título
    async obtenerIdReceta(titulo) {
        try {
            const response = await fetch(`${this.API_URL}/recetas?titulo=${encodeURIComponent(titulo)}`);
            if (!response.ok) throw new Error('Error al buscar receta');
            
            const recetas = await response.json();
            if (recetas.length > 0) {
                return recetas[0]._id;
            }
            return null;
        } catch (error) {
            console.error('❌ Error obteniendo ID de receta:', error);
            return null;
        }
    }

    // Configurar eventos de favoritos en todas las recetas
    setupBookmarks() {
        const bookmarkIcons = document.querySelectorAll('.bookmark-icon');
        
        bookmarkIcons.forEach(icon => {
            const item = icon.closest('.menu-item');
            if (!item) return;
            
            const titulo = this.obtenerTituloReceta(item);
            if (!titulo) return;

            // Verificar si ya está en favoritos y actualizar icono
            this.actualizarIconoEstado(icon, titulo);

            // Agregar evento de clic
            icon.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.toggleFavorito(titulo, icon);
            });

            // Cambiar cursor
            icon.style.cursor = 'pointer';
        });
        
        console.log(`🔖 ${bookmarkIcons.length} iconos de favoritos configurados`);
    }

    // Actualizar estado visual del icono
    async actualizarIconoEstado(icon, titulo) {
        // Obtener ID de la receta
        const idReceta = await this.obtenerIdReceta(titulo);
        
        if (idReceta && this.favoritos.has(idReceta)) {
            icon.classList.add('bookmarked');
            icon.style.filter = 'brightness(0) saturate(100%) invert(71%) sepia(63%) saturate(2234%) hue-rotate(2deg) brightness(104%) contrast(101%)';
            icon.title = 'Quitar de favoritos';
        } else {
            icon.classList.remove('bookmarked');
            icon.style.filter = '';
            icon.title = 'Agregar a favoritos';
        }
    }

    // Alternar favorito
    async toggleFavorito(titulo, icon) {
        // Verificar autenticación
        const session = localStorage.getItem('userSession');
        if (!session) {
            this.mostrarToast('⚠️ Debes iniciar sesión para guardar favoritos');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        const user = JSON.parse(session);
        
        // Mostrar loading
        icon.style.opacity = '0.5';
        icon.style.pointerEvents = 'none';

        try {
            // Obtener ID de la receta
            const idReceta = await this.obtenerIdReceta(titulo);
            if (!idReceta) {
                throw new Error('No se pudo encontrar la receta');
            }

            const estaEnFavoritos = this.favoritos.has(idReceta);
            
            if (estaEnFavoritos) {
                // Eliminar de favoritos
                await this.eliminarFavorito(user.nombreUsuario, idReceta);
                this.favoritos.delete(idReceta);
                
                icon.classList.remove('bookmarked');
                icon.style.filter = '';
                icon.title = 'Agregar a favoritos';
                
                this.mostrarToast('❌ Receta eliminada de favoritos');
            } else {
                // Agregar a favoritos
                await this.agregarFavorito(user.nombreUsuario, idReceta);
                this.favoritos.add(idReceta);
                
                icon.classList.add('bookmarked');
                icon.style.filter = 'brightness(0) saturate(100%) invert(71%) sepia(63%) saturate(2234%) hue-rotate(2deg) brightness(104%) contrast(101%)';
                icon.title = 'Quitar de favoritos';
                
                this.mostrarToast('⭐ Receta agregada a favoritos');
            }

            // Animación
            icon.classList.add('bookmark-animation');
            setTimeout(() => {
                icon.classList.remove('bookmark-animation');
            }, 300);

        } catch (error) {
            console.error('❌ Error al cambiar favorito:', error);
            this.mostrarToast('❌ Error al guardar favorito. Intenta de nuevo.');
        } finally {
            // Restaurar icono
            icon.style.opacity = '1';
            icon.style.pointerEvents = 'auto';
        }
    }

    // Agregar receta a favoritos (API)
    async agregarFavorito(usuario, idReceta) {
        const response = await fetch(`${this.API_URL}/usuarios/${usuario}/favoritos/${idReceta}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Error al agregar a favoritos');
        }

        const data = await response.json();
        console.log('✅ Favorito agregado:', data);
        return data;
    }

    // Eliminar receta de favoritos (API)
    async eliminarFavorito(usuario, idReceta) {
        const response = await fetch(`${this.API_URL}/usuarios/${usuario}/favoritos/${idReceta}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Error al eliminar de favoritos');
        }

        const data = await response.json();
        console.log('✅ Favorito eliminado:', data);
        return data;
    }

    // Obtener todos los favoritos del usuario
    async obtenerFavoritos(usuario) {
        try {
            const response = await fetch(`${this.API_URL}/usuarios/${usuario}/favoritos`);
            if (!response.ok) throw new Error('Error al obtener favoritos');
            
            const favoritos = await response.json();
            console.log('📚 Favoritos obtenidos:', favoritos);
            return favoritos;
        } catch (error) {
            console.error('❌ Error obteniendo favoritos:', error);
            return [];
        }
    }

    // Mostrar notificación toast
    mostrarToast(mensaje) {
        // Eliminar toast anterior si existe
        const existingToast = document.querySelector('.favoritos-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'favoritos-toast';
        toast.textContent = mensaje;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 1em;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            z-index: 10000;
            animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
        `;

        // Agregar animaciones CSS si no existen
        if (!document.getElementById('favoritosToastStyles')) {
            const style = document.createElement('style');
            style.id = 'favoritosToastStyles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
                .bookmark-animation {
                    animation: bookmarkPulse 0.3s ease;
                }
                @keyframes bookmarkPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Eliminar después de 3 segundos
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Verificar si una receta está en favoritos
    async estaEnFavoritos(titulo) {
        const idReceta = await this.obtenerIdReceta(titulo);
        return idReceta ? this.favoritos.has(idReceta) : false;
    }

    // Recargar favoritos (útil después de login)
    async recargar() {
        this.favoritos.clear();
        await this.cargarFavoritos();
        this.setupBookmarks();
    }
}

// Inicializar el sistema cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.favoritosSystem = new FavoritosSystem();
    });
} else {
    window.favoritosSystem = new FavoritosSystem();
}

// Exportar para uso global
window.FavoritosSystem = FavoritosSystem;