// Sistema de Calificación Interactivo - La Cabaña (con API)
// =========================================================

class RatingSystem {
    constructor() {
        this.API_URL = 'https://backend-vjgm.onrender.com/api';
        this.API_BASE = 'https://backend-vjgm.onrender.com';
        this.ratings = {}; // Cache local
        this.userRatings = this.loadUserRatings();
        this.init();
    }

    // Inicializar el sistema
    async init() {
        this.createModal();
        await this.loadRatingsFromAPI();
        this.setupRatings();
        this.setupBookmarks();
    }

    // Cargar calificaciones desde la API
    async loadRatingsFromAPI() {
        try {
            const response = await fetch(`${this.API_URL}/valoraciones`);
            if (!response.ok) throw new Error('Error al cargar valoraciones');
            
            const valoraciones = await response.json();
            
            // Organizar valoraciones por receta
            this.ratings = {};
            valoraciones.forEach(val => {
                if (!this.ratings[val.recetaTitulo]) {
                    this.ratings[val.recetaTitulo] = [];
                }
                this.ratings[val.recetaTitulo].push({
                    estrellas: val.estrellas,
                    usuario: val.usuario,
                    comentario: val.comentario
                });
            });
            
            console.log('✅ Valoraciones cargadas:', this.ratings);
        } catch (error) {
            console.error('❌ Error cargando valoraciones:', error);
        }
    }

    // Cargar calificaciones del usuario desde localStorage
    loadUserRatings() {
        const stored = localStorage.getItem('lacabana_user_ratings');
        return stored ? JSON.parse(stored) : {};
    }

    // Guardar calificaciones del usuario en localStorage
    saveUserRatings() {
        localStorage.setItem('lacabana_user_ratings', JSON.stringify(this.userRatings));
    }

    // Crear modal de confirmación
    createModal() {
        if (document.getElementById('ratingModal')) return;

        const modal = document.createElement('div');
        modal.id = 'ratingModal';
        modal.className = 'rating-modal';
        modal.innerHTML = `
            <div class="rating-modal-content">
                <div class="rating-modal-icon">⭐</div>
                <h3>¡Gracias por tu calificación!</h3>
                <p id="ratingModalMessage">Tu opinión nos ayuda a mejorar</p>
                <button class="rating-modal-close" onclick="ratingSystem.closeModal()">Cerrar</button>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    showModal(message = 'Tu opinión nos ayuda a mejorar') {
        const modal = document.getElementById('ratingModal');
        const messageEl = document.getElementById('ratingModalMessage');
        if (modal && messageEl) {
            messageEl.textContent = message;
            modal.classList.add('active');
            setTimeout(() => this.closeModal(), 3000);
        }
    }

    closeModal() {
        const modal = document.getElementById('ratingModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Obtener ID único del elemento
    getItemId(element) {
        const h2 = element.querySelector('h2');
        return h2 ? h2.textContent.trim() : null;
    }

    // Calcular promedio de calificaciones
    calculateAverage(itemId) {
        const itemRatings = this.ratings[itemId];
        if (!itemRatings || itemRatings.length === 0) return 0;
        
        const sum = itemRatings.reduce((a, b) => a + (b.estrellas || b), 0);
        return (sum / itemRatings.length).toFixed(1);
    }

    // Obtener número de calificaciones
    getRatingCount(itemId) {
        return this.ratings[itemId] ? this.ratings[itemId].length : 0;
    }

    // Configurar sistema de calificación
    setupRatings() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            const itemId = this.getItemId(item);
            if (!itemId) return;
            
            const ratingContainer = item.querySelector('.rating-stars');
            if (!ratingContainer) return;
            
            ratingContainer.textContent = '';

            const currentRating = this.userRatings[itemId] || 0;
            const averageRating = this.calculateAverage(itemId);
            const ratingCount = this.getRatingCount(itemId);

            ratingContainer.className = 'rating-stars-interactive';
            ratingContainer.innerHTML = this.createStarsHTML(currentRating, averageRating, ratingCount);
            ratingContainer.dataset.itemId = itemId;

            this.addRatingEvents(ratingContainer);
        });
    }

    // Crear HTML de estrellas
    createStarsHTML(userRating, averageRating, ratingCount) {
        let html = '<div class="rating-tooltip">Califica esta receta</div>';
        
        for (let i = 1; i <= 5; i++) {
            const filled = i <= userRating ? 'filled' : '';
            html += `<span class="star ${filled}" data-rating="${i}">★</span>`;
        }
        
        if (ratingCount > 0) {
            html += `<span class="rating-text">${averageRating}</span>`;
            html += `<span class="rating-count">(${ratingCount})</span>`;
        }
        
        return html;
    }

    // Agregar eventos de calificación
    addRatingEvents(container) {
        const stars = container.querySelectorAll('.star');
        const itemId = container.dataset.itemId;

        stars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => {
                this.highlightStars(stars, index + 1);
            });

            star.addEventListener('click', async (e) => {
                e.stopPropagation();
                const rating = parseInt(star.dataset.rating);
                await this.submitRating(itemId, rating, container);
            });
        });

        container.addEventListener('mouseleave', () => {
            const currentRating = this.userRatings[itemId] || 0;
            this.highlightStars(stars, currentRating);
        });
    }

    // Resaltar estrellas
    highlightStars(stars, count) {
        stars.forEach((star, index) => {
            if (index < count) {
                star.classList.add('hover');
            } else {
                star.classList.remove('hover');
            }
        });
    }

    // Enviar calificación a la API
    async submitRating(itemId, rating, container) {
        // Verificar si el usuario está logueado
        const session = localStorage.getItem('userSession');
        if (!session) {
            this.showToast('⚠️ Debes iniciar sesión para calificar');
            return;
        }

        const user = JSON.parse(session);
        
        try {
            // Enviar valoración a la API
            const response = await fetch(`${this.API_URL}/valoraciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recetaTitulo: itemId,
                    usuario: user.nombreUsuario,
                    estrellas: rating,
                    calificacion: rating,
                    comentario: '',
                    fecha: new Date()
                })
            });

            if (!response.ok) throw new Error('Error al guardar valoración');

            // Actualizar estado local
            const previousRating = this.userRatings[itemId];
            this.userRatings[itemId] = rating;
            this.saveUserRatings();

            // Actualizar cache local
            if (!this.ratings[itemId]) {
                this.ratings[itemId] = [];
            }
            
            if (previousRating) {
                const userRatingIndex = this.ratings[itemId].findIndex(
                    r => r.usuario === user.nombreUsuario
                );
                if (userRatingIndex > -1) {
                    this.ratings[itemId][userRatingIndex].estrellas = rating;
                } else {
                    this.ratings[itemId].push({ estrellas: rating, usuario: user.nombreUsuario });
                }
            } else {
                this.ratings[itemId].push({ estrellas: rating, usuario: user.nombreUsuario });
            }

            // Actualizar UI
            this.updateRatingDisplay(itemId, container);

            // Animación de confirmación
            container.classList.add('rating-submitted');
            setTimeout(() => {
                container.classList.remove('rating-submitted');
            }, 500);

            const messages = [
                '¡Excelente! Tu calificación ha sido registrada',
                '¡Gracias! Tu opinión es muy valiosa',
                '¡Genial! Hemos guardado tu calificación',
                '¡Perfecto! Tu voto ha sido contabilizado'
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            this.showModal(randomMessage);

        } catch (error) {
            console.error('❌ Error al enviar calificación:', error);
            this.showToast('❌ Error al guardar tu calificación');
        }
    }

    // Actualizar display de calificación
    updateRatingDisplay(itemId, container) {
        const userRating = this.userRatings[itemId];
        const averageRating = this.calculateAverage(itemId);
        const ratingCount = this.getRatingCount(itemId);

        const stars = container.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < userRating) {
                star.classList.add('filled');
            } else {
                star.classList.remove('filled');
            }
        });

        let ratingText = container.querySelector('.rating-text');
        let ratingCountEl = container.querySelector('.rating-count');

        if (ratingCount > 0) {
            if (!ratingText) {
                ratingText = document.createElement('span');
                ratingText.className = 'rating-text';
                container.appendChild(ratingText);
            }
            ratingText.textContent = averageRating;

            if (!ratingCountEl) {
                ratingCountEl = document.createElement('span');
                ratingCountEl.className = 'rating-count';
                container.appendChild(ratingCountEl);
            }
            ratingCountEl.textContent = `(${ratingCount})`;
        }
    }

    // Configurar sistema de marcadores (favoritos)
    setupBookmarks() {
        const bookmarkIcons = document.querySelectorAll('.bookmark-icon');

        bookmarkIcons.forEach(icon => {
            const item = icon.closest('.menu-item');
            const itemId = this.getItemId(item);
            if (!itemId) return;

            icon.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.toggleBookmark(itemId, icon);
            });
        });
    }

    // Alternar marcador (favorito)
    async toggleBookmark(recetaTitulo, icon) {
        const session = localStorage.getItem('userSession');
        if (!session) {
            this.showToast('⚠️ Debes iniciar sesión para guardar favoritos');
            return;
        }

        const user = JSON.parse(session);
        
        try {
            // Aquí puedes implementar la lógica de favoritos con la API
            // Por ahora solo mostraremos un mensaje
            this.showToast('✨ Función de favoritos en desarrollo');
        } catch (error) {
            console.error('Error:', error);
            this.showToast('❌ Error al guardar favorito');
        }
    }

    // Mostrar toast notification
    showToast(message) {
        const existingToast = document.querySelector('.rating-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'rating-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background-color: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 1em;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
        `;

        if (!document.getElementById('toastStyles')) {
            const style = document.createElement('style');
            style.id = 'toastStyles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(400px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Inicializar el sistema cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ratingSystem = new RatingSystem();
    });
} else {
    window.ratingSystem = new RatingSystem();
}