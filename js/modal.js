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
    // ✅ CORREGIDO: No cerrar si se hace clic dentro del contenido del modal
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
        // ✅ CORREGIDO: Usar addEventListener en lugar de onclick
        btn.removeEventListener('click', handleToggleClick); // Remover listeners previos
        btn.addEventListener('click', handleToggleClick);
    });
}

// ✅ NUEVA FUNCIÓN: Manejar toggle de comentarios
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
// INICIALIZAR BOOKMARK EN MODAL (✅ CORREGIDO: Usar favoritosSystem)
// --------------------------------------------------------
function inicializarGuardarModal(modalContainer, itemId) {
    const bookmark = modalContainer.querySelector(".bookmark-icon-modal");
    if (!bookmark) return;

    // ✅ CORRECCIÓN: Usar favoritosSystem en lugar de ratingSystem
    if (window.favoritosSystem) {
        // Verificar si está en favoritos
        const esFavorito = favoritosSystem.esFavorito(itemId);
        
        // Aplicar el estilo visual
        bookmark.style.filter = esFavorito
            ? 'brightness(0) saturate(100%) invert(71%) sepia(63%) saturate(2234%) hue-rotate(2deg) brightness(104%) contrast(101%)'
            : '';
        
        bookmark.classList.toggle('bookmarked', esFavorito);

        // Manejar clic
        bookmark.onclick = async (e) => {
            e.stopPropagation();
            await favoritosSystem.toggleFavorito(itemId, bookmark);
        };
    } else {
        console.warn('⚠️ Sistema de favoritos no disponible');
        bookmark.onclick = (e) => {
            e.stopPropagation();
            alert("Sistema de favoritos no disponible. Por favor, recarga la página.");
        };
    }
}

// --------------------------------------------------------
// INICIALIZAR ESTRELLAS EN MODAL
// --------------------------------------------------------
function inicializarEstrellasModal(modalContainer, itemId) {
    if (!window.ratingSystem) return;

    const container = modalContainer.querySelector(".rating-stars");
    if (!container) return;

    const userRating = ratingSystem.userRatings[itemId] || 0;
    const averageRating = ratingSystem.calculateAverage(itemId);
    const ratingCount = ratingSystem.getRatingCount(itemId);

    container.className = "rating-stars-interactive";
    container.innerHTML = ratingSystem.createStarsHTML(userRating, averageRating, ratingCount);
    container.dataset.itemId = itemId;

    ratingSystem.addRatingEvents(container);
}

// --------------------------------------------------------
// CLICK EN TARJETAS (RECETA & BLOG)
// --------------------------------------------------------
document.addEventListener("click", function (e) {
    const card = e.target.closest("article.menu-item, .tarjeta");
    if (!card) return;

    // Evitar abrir modal al hacer clic en marcadores, estrellas o controles de comentarios
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
        const textoDesc = card.querySelector(".item-text p")?.innerHTML || "";

        // ✅ Obtener el ID de la receta
        const recetaId = card.getAttribute('data-receta-id');

        contenidoHTML = `
            <div style="display:flex; flex-direction:column; gap:15px; width:100%;">
                ${imagenSrc ? `<img src="${imagenSrc}" style="width:100%; max-height:350px; object-fit:cover; border-radius:12px;">` : ""}
                <div style="font-size:1.1em; line-height:1.6; color:#4a2c2a; text-align:justify;">
                    ${textoDesc}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                    <div class="rating-stars"></div>
                    <img src="img/guardar.png" alt="Guardar" class="bookmark-icon-modal" style="width:35px; cursor:pointer;">
                </div>
            </div>
        `;

        tituloModal.innerText = tituloTexto;
        descripcionModal.innerHTML = contenidoHTML;

        // ✅ Inicializar sistemas usando el ID correcto
        if (recetaId) {
            if (window.ratingSystem) {
                inicializarEstrellasModal(descripcionModal, recetaId);
            }
            if (window.favoritosSystem) {
                inicializarGuardarModal(descripcionModal, recetaId);
            }
        } else {
            console.warn('⚠️ No se encontró data-receta-id en la tarjeta');
        }

        modal.style.display = "flex";
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
        
        // ✅ OBTENER EL BLOG ID
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

            // ✅ ELIMINAR el formulario de comentarios del modal
            const commentForm = modalComentarios.querySelector('.comment-form');
            if (commentForm) {
                commentForm.remove();
            }

            // ✅ Activar comentarios en el modal (solo toggle)
            activarComentarios(modalComentarios);
            
            // ✅ AGREGAR: Mensaje informativo
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

// ✅ FUNCIÓN PARA COMENTARIOS FUERA DEL MODAL (vista normal)
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

    // Crear el comentario
    const nuevoComentario = document.createElement("div");
    nuevoComentario.className = "comment-item";
    nuevoComentario.innerHTML = `
        <p style="margin:5px 0;">${text}</p>
    `;

    // Insertarlo en la lista
    commentList.appendChild(nuevoComentario);

    // Actualizar contador
    if (countSpan) {
        const currentCount = parseInt(countSpan.textContent) || 0;
        countSpan.textContent = currentCount + 1;
    }

    // Limpiar textarea
    textarea.value = "";
    
    // Actualizar contador de caracteres
    const charCount = container.querySelector('.char-count');
    if (charCount) {
        charCount.textContent = '0/500';
    }
}
