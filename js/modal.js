// ELEMENTOS DEL DOM
const modal = document.getElementById("modalReceta");
const tituloModal = document.getElementById("tituloReceta");
const descripcionModal = document.getElementById("descripcionReceta");
const cerrarBtn = document.querySelector(".cerrar");
const contenidoModalDiv = document.querySelector(".modal-contenido");

let seccionComentariosMovida = null;
let padreOriginalComentarios = null;

// ✅ VERIFICAR SESIÓN DEL USUARIO
const rawSession = localStorage.getItem('userSession');
const session = rawSession ? JSON.parse(rawSession) : {};
const nombreUsuario = session.nombreUsuario || "Invitado";
let usuarioLogueado = false;

// Si hay un nombreUsuario válido y no es "Invitado", el usuario está logueado
if (nombreUsuario && nombreUsuario !== "Invitado") {
    usuarioLogueado = true;
}

// --------------------------------------------------------
// CERRAR MODAL
// --------------------------------------------------------
function cerrarModal() {
    modal.style.display = "none";

    if (seccionComentariosMovida && padreOriginalComentarios) {
        padreOriginalComentarios.appendChild(seccionComentariosMovida);
        seccionComentariosMovida = null;
        padreOriginalComentarios = null;
    }

    tituloModal.textContent = "";
    descripcionModal.innerHTML = "";
}

cerrarBtn.onclick = cerrarModal;
window.onclick = (e) => { 
    if (e.target === modal && !e.target.closest('.modal-contenido')) {
        cerrarModal();
    }
};

// --------------------------------------------------------
// ACTIVAR TOGGLE DE COMENTARIOS (BLOG)
// --------------------------------------------------------
function activarComentarios(container) {
    if (!container) return;
    const toggles = container.querySelectorAll(".toggle-comments");

    toggles.forEach(btn => {
        btn.removeEventListener('click', handleToggleClick);
        btn.addEventListener('click', handleToggleClick);
    });
}

function handleToggleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const btn = e.currentTarget;
    const container = btn.closest('.comments-section');
    if (!container) return;
    
    const lista = container.querySelector(".comments-container");
    if (!lista) return;

    if (lista.style.display === "block") {
        lista.style.display = "none";
        btn.innerText = "Ver comentarios ▼";
    } else {
        lista.style.display = "block";
        btn.innerText = "Ocultar comentarios ▲";

        if (lista.querySelector(".comments-list").children.length === 0) {
            lista.querySelector(".comments-list").innerHTML =
                '<p style="font-style:italic; color:#666;">No hay comentarios. Sé el primero en comentar.</p>';
        }
    }
}

// --------------------------------------------------------
// INICIALIZAR BOOKMARK EN MODAL (✅ CON PROTECCIÓN)
// --------------------------------------------------------
function inicializarGuardarModal(modalContainer, itemId) {
    const bookmark = modalContainer.querySelector(".bookmark-icon-modal");
    if (!bookmark) return;

    // ✅ VERIFICAR QUE favoritosSystem EXISTE Y TIENE LA FUNCIÓN
    if (window.favoritosSystem && typeof window.favoritosSystem.esFavorito === 'function') {
        try {
            const esFavorito = favoritosSystem.esFavorito(itemId);
            
            bookmark.style.filter = esFavorito
                ? 'brightness(0) saturate(100%) invert(71%) sepia(63%) saturate(2234%) hue-rotate(2deg) brightness(104%) contrast(101%)'
                : '';
            
            bookmark.classList.toggle('bookmarked', esFavorito);

            bookmark.onclick = async (e) => {
                e.stopPropagation();
                await favoritosSystem.toggleFavorito(itemId, bookmark);
            };
        } catch (error) {
            console.warn('⚠️ Error al inicializar favoritos:', error);
            bookmark.onclick = (e) => {
                e.stopPropagation();
                alert("Error al gestionar favoritos. Por favor, recarga la página.");
            };
        }
    } else {
        console.warn('⚠️ Sistema de favoritos no disponible');
        // ✅ FUNCIONALIDAD BÁSICA SIN SISTEMA DE FAVORITOS
        bookmark.onclick = (e) => {
            e.stopPropagation();
            bookmark.classList.toggle('bookmarked');
            const isBookmarked = bookmark.classList.contains('bookmarked');
            bookmark.style.filter = isBookmarked
                ? 'brightness(0) saturate(100%) invert(71%) sepia(63%) saturate(2234%) hue-rotate(2deg) brightness(104%) contrast(101%)'
                : '';
            alert(isBookmarked ? "✅ Agregado a favoritos (temporal)" : "❌ Eliminado de favoritos");
        };
    }
}

// --------------------------------------------------------
// INICIALIZAR ESTRELLAS EN MODAL
// --------------------------------------------------------
function inicializarEstrellasModal(modalContainer, itemId) {
    if (!window.ratingSystem) {
        console.warn('⚠️ Sistema de calificación no disponible');
        return;
    }

    const container = modalContainer.querySelector(".rating-stars");
    if (!container) return;

    try {
        const userRating = ratingSystem.userRatings[itemId] || 0;
        const averageRating = ratingSystem.calculateAverage(itemId);
        const ratingCount = ratingSystem.getRatingCount(itemId);

        container.className = "rating-stars-interactive";
        container.innerHTML = ratingSystem.createStarsHTML(userRating, averageRating, ratingCount);
        container.dataset.itemId = itemId;

        ratingSystem.addRatingEvents(container);
    } catch (error) {
        console.warn('⚠️ Error al inicializar estrellas:', error);
    }
}

// --------------------------------------------------------
// CLICK EN TARJETAS (RECETA & BLOG)
// --------------------------------------------------------
document.addEventListener("click", function (e) {
    const card = e.target.closest("article.menu-item, .tarjeta");
    if (!card) return;

    // Evitar abrir modal al hacer clic en marcadores, estrellas o controles
    if (e.target.closest("button, a, .bookmark-icon, .rating-stars-interactive, .comments-section, textarea")) return;

    // Ajustar estilos del modal
    if (contenidoModalDiv) {
        Object.assign(contenidoModalDiv.style, {
            backgroundColor: "#fff8e7",
            maxHeight: "90vh",
            overflowY: "auto",
            width: "90%",
            maxWidth: "700px",
            borderRadius: "15px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "20px"
        });
    }

    let tituloTexto = "";
    let contenidoHTML = "";
    let imagenSrc = "";

    // ----------------------------------------------------
    // RECETAS
    // ----------------------------------------------------
    if (card.classList.contains("menu-item")) {
        
        tituloTexto = card.querySelector(".item-text h2")?.innerText || "Receta";
        imagenSrc = card.querySelector(".item-image")?.src || "";
        
        const recetaId = card.getAttribute('data-receta-id');
        
        console.log('🔍 ID de receta obtenido:', recetaId);

        if (recetaId) {
            // ✅ MOSTRAR INDICADOR DE CARGA
            contenidoHTML = `
                <div style="display:flex; justify-content:center; align-items:center; min-height:200px;">
                    <p style="font-size:1.2em; color:#666;">⏳ Cargando receta...</p>
                </div>
            `;
            
            tituloModal.innerText = tituloTexto;
            descripcionModal.innerHTML = contenidoHTML;
            modal.style.display = "flex";

            // ✅ Obtener receta específica
            fetch(`${API_URL}/recetas`)
                .then(response => {
                    console.log('📥 Respuesta recibida:', response.status);
                    if (!response.ok) {
                        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(recetas => {
                    const receta = recetas.find(r => r._id === recetaId);
                    
                    if (!receta) {
                        throw new Error('Receta no encontrada');
                    }
                    
                    console.log('✅ Receta encontrada:', receta);
                    
                    // ✅ CONVERTIR INGREDIENTES
                    let ingredientesHTML = '';
                    if (receta.ingredientes) {
                        let ingredientesTexto = '';
                        
                        if (Array.isArray(receta.ingredientes)) {
                            // Si es un array, convertir cada elemento en una línea
                            ingredientesTexto = receta.ingredientes
                                .map(ing => ing.trim())
                                .filter(ing => ing.length > 0)
                                .join('\n');
                        } else if (typeof receta.ingredientes === 'string') {
                            ingredientesTexto = receta.ingredientes;
                        }
                        
                        if (ingredientesTexto) {
                            ingredientesHTML = `
                                <div style="background-color:#fff; padding:15px; border-radius:8px; margin-bottom:15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <h3 style="color:#8b4513; margin-bottom:10px; font-size:1.3em;">🥗 Ingredientes:</h3>
                                    <div style="white-space:pre-line; line-height:1.8; font-size:1.05em; color:#333;">${ingredientesTexto}</div>
                                </div>
                            `;
                        }
                    }

                    // ✅ PROCEDIMIENTO/DESCRIPCIÓN
                    let procedimientoHTML = '';
                    if (receta.descripcion) {
                        procedimientoHTML = `
                            <div style="background-color:#fff; padding:15px; border-radius:8px; margin-bottom:15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h3 style="color:#8b4513; margin-bottom:10px; font-size:1.3em;">👨‍🍳 Preparación:</h3>
                                <div style="white-space:pre-line; line-height:1.8; text-align:justify; font-size:1.05em; color:#333;">${receta.descripcion}</div>
                            </div>
                        `;
                    }

                    // ✅ IMAGEN
                    const imagenURL = receta.imagen?.almacenadoEn
                        ? (receta.imagen.almacenadoEn.startsWith('http') 
                            ? receta.imagen.almacenadoEn 
                            : `${API_BASE}${receta.imagen.almacenadoEn}`)
                        : imagenSrc;

                    // ✅ CONSTRUIR HTML COMPLETO
                    contenidoHTML = `
                        <div style="display:flex; flex-direction:column; gap:15px; width:100%;">
                            ${imagenURL ? `<img src="${imagenURL}" style="width:100%; max-height:350px; object-fit:cover; border-radius:12px; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">` : ""}
                            
                            ${ingredientesHTML}
                            ${procedimientoHTML}
                            
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; background-color:#fff; padding:10px; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <div class="rating-stars"></div>
                                <img src="img/guardar.png" alt="Guardar" class="bookmark-icon-modal" style="width:35px; cursor:pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                            </div>
                        </div>
                    `;

                    descripcionModal.innerHTML = contenidoHTML;

                    // ✅ Inicializar sistemas CON PROTECCIÓN
                    setTimeout(() => {
                        try {
                            if (window.ratingSystem) {
                                inicializarEstrellasModal(descripcionModal, recetaId);
                            }
                        } catch (e) {
                            console.warn('⚠️ Error al inicializar estrellas:', e);
                        }
                        
                        try {
                            inicializarGuardarModal(descripcionModal, recetaId);
                        } catch (e) {
                            console.warn('⚠️ Error al inicializar favoritos:', e);
                        }
                    }, 100);
                })
                .catch(error => {
                    console.error('❌ Error completo:', error);
                    
                    descripcionModal.innerHTML = `
                        <div style="text-align:center; padding:20px;">
                            <p style="color:#d32f2f; font-size:1.1em; margin-bottom:10px;">❌ Error al cargar la receta</p>
                            <p style="color:#666; font-size:0.9em;">${error.message}</p>
                            <button onclick="cerrarModal()" style="margin-top:15px; padding:10px 20px; background:#8b4513; color:white; border:none; border-radius:5px; cursor:pointer;">Cerrar</button>
                        </div>
                    `;
                });
        } else {
            console.warn('⚠️ No se encontró data-receta-id en la tarjeta');
            alert('No se pudo cargar la receta. Falta el identificador.');
        }

        return;
    }

    // ----------------------------------------------------
    // BLOGS
    // ----------------------------------------------------
    if (card.classList.contains("tarjeta")) {

        tituloTexto = card.querySelector("h3")?.innerText || "Consejo";
        imagenSrc = card.querySelector("img:not(.descrip img):not(.social-media img)")?.src || "";
        const parrafos = Array.from(card.querySelectorAll("p"));
        const textoDesc = parrafos.find(p => !p.closest(".descrip"))?.innerHTML || "";
        const infoUsuarioHTML = card.querySelector(".descrip")?.outerHTML || "";
        const comentariosSection = card.querySelector(".comments-section");
        
        const blogId = card.getAttribute('data-blog-id');

        contenidoHTML = `
            <div style="display:flex; flex-direction:column; gap:15px; width:100%;">
                ${imagenSrc ? `<img src="${imagenSrc}" style="width:100%; max-height:350px; object-fit:cover; border-radius:12px;">` : ""}
                <div style="font-size:1.1em; line-height:1.6; color:#333; text-align:justify;">
                    ${textoDesc}
                </div>
                <div style="background-color:rgba(255,255,255,0.6); padding:10px; border-radius:8px; border:1px solid #e0d5c7;">
                    ${infoUsuarioHTML}
                </div>
                ${comentariosSection ? comentariosSection.outerHTML : ""}
            </div>
        `;

        tituloModal.innerText = tituloTexto;
        descripcionModal.innerHTML = contenidoHTML;

        // Mover comentarios
        if (comentariosSection) {
            seccionComentariosMovida = comentariosSection;
            padreOriginalComentarios = card;

            const modalComentarios = descripcionModal.querySelector(".comments-section");

            const commentForm = modalComentarios.querySelector('.comment-form');
            if (commentForm) {
                commentForm.remove();
            }

            activarComentarios(modalComentarios);
            
            const commentsContainer = modalComentarios.querySelector('.comments-container');
            if (commentsContainer && !commentsContainer.querySelector('.modal-info-message')) {
                const infoMessage = document.createElement('p');
                infoMessage.className = 'modal-info-message';
                infoMessage.style.cssText = 'font-style: italic; color: #666; text-align: center; padding: 10px; background-color: #f0f0f0; border-radius: 5px; margin-top: 10px;';
                infoMessage.textContent = 'Cierra esta ventana para agregar comentarios';
                commentsContainer.appendChild(infoMessage);
            }
        }

        modal.style.display = "flex";
        return;
    }
});

// ✅ FUNCIÓN PARA COMENTARIOS FUERA DEL MODAL
function addComment(blogId = null) {
    const button = document.activeElement;
    const container = button.closest(".comments-section");
    if (!container) return;

    const textarea = container.querySelector("textarea");
    const commentList = container.querySelector(".comments-list");
    const countSpan = container.querySelector(".comments-count");

    if (!textarea || !commentList) return;

    const text = textarea.value.trim();
    if (text === "") {
        alert("Escribe un comentario antes de publicar.");
        return;
    }

    const nuevoComentario = document.createElement("div");
    nuevoComentario.className = "comment-item";
    nuevoComentario.innerHTML = `
        <p style="margin:5px 0;">${text}</p>
    `;

    commentList.appendChild(nuevoComentario);

    if (countSpan) {
        const currentCount = parseInt(countSpan.textContent) || 0;
        countSpan.textContent = currentCount + 1;
    }

    textarea.value = "";
    
    const charCount = container.querySelector('.char-count');
    if (charCount) {
        charCount.textContent = '0/500';
    }
}

// ✅ EXPONER FUNCIÓN CERRAR MODAL GLOBALMENTE
window.cerrarModal = cerrarModal;
