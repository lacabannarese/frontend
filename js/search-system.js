// Sistema de búsqueda para La Cabaña - VERSIÓN FINAL
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const clearButton = document.getElementById('clear-search');
    const menuGrid = document.getElementById('publicadas-grid');
    
    // Función para normalizar texto (elimina acentos)
    function normalizeText(text) {
        return text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    // Función para realizar la búsqueda
    function performSearch() {
        // Buscar elementos CADA VEZ (ya que se cargan dinámicamente)
        const menuItems = menuGrid ? menuGrid.querySelectorAll('.menu-item') : [];
        const searchTerm = normalizeText(searchInput.value);
        let hasResults = false;

        if (menuItems.length === 0) {
            console.log('⚠️ No hay recetas cargadas aún');
            return;
        }

        menuItems.forEach(item => {
            // Buscar en título (h2) y descripción (p)
            const titleElement = item.querySelector('h2');
            const descriptionElement = item.querySelector('p');
            
            let searchableText = '';
            if (titleElement) searchableText += normalizeText(titleElement.textContent) + ' ';
            if (descriptionElement) searchableText += normalizeText(descriptionElement.textContent) + ' ';

            // Búsqueda por palabras individuales
            const searchWords = searchTerm.split(' ').filter(word => word.length > 0);
            const matches = searchWords.every(word => searchableText.includes(word));

            if (matches || searchTerm === '') {
                item.style.display = '';
                item.style.animation = 'fadeIn 0.3s ease-in';
                hasResults = true;
            } else {
                item.style.display = 'none';
            }
        });

        // Mostrar mensaje de sin resultados
        toggleNoResultsMessage(!hasResults && searchTerm !== '');
    }

    // Función para mostrar/ocultar mensaje de sin resultados
    function toggleNoResultsMessage(show) {
        let noResultsMessage = document.getElementById('no-results-message');
        
        if (show) {
            if (!noResultsMessage) {
                noResultsMessage = document.createElement('div');
                noResultsMessage.id = 'no-results-message';
                noResultsMessage.className = 'no-results';
                noResultsMessage.innerHTML = `
                    <div class="no-results-content">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <h3>No se encontraron resultados</h3>
                        <p>Intenta con otros términos de búsqueda</p>
                    </div>
                `;
                menuGrid.parentElement.insertBefore(noResultsMessage, menuGrid);
            } else {
                noResultsMessage.style.display = 'block';
            }
        } else {
            if (noResultsMessage) {
                noResultsMessage.style.display = 'none';
            }
        }
    }

    // Event Listeners
    if (searchInput) {
        // Búsqueda en tiempo real con debounce
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(performSearch, 300);
            
            // Mostrar/ocultar botón de limpiar
            if (clearButton) {
                clearButton.style.display = this.value ? 'block' : 'none';
            }
        });
        
        // Búsqueda al presionar Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(searchTimeout);
                performSearch();
                this.blur();
            }
        });
    }

    // Botón de limpiar
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            this.style.display = 'none';
            performSearch();
            searchInput.focus();
        });
    }

    // Observar cuando se carguen las recetas
    if (menuGrid) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    const items = menuGrid.querySelectorAll('.menu-item');
                    if (items.length > 0) {
                        console.log(`✅ ${items.length} recetas cargadas - Sistema de búsqueda listo`);
                    }
                }
            });
        });
        
        observer.observe(menuGrid, { childList: true });
    }

    console.log('🔍 Sistema de búsqueda inicializado');
});