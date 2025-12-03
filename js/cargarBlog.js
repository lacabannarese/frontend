// ========================================
// CONFIGURACIÓN Y SESIÓN
// ========================================
const API_URL = 'https://backend-vjgm.onrender.com/api';
const API_BASE = 'https://backend-vjgm.onrender.com';

// ✅ MANEJO DE SESIÓN (igual que cargarReceta.js)
const rawSession = localStorage.getItem('userSession');
const session = rawSession ? JSON.parse(rawSession) : {};
const nombreUsuario = session.nombreUsuario || "Invitado";

// ========================================
// FUNCIONES HELPER (de cargarReceta.js)
// ========================================
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;", 
    "<": "&lt;", 
    ">": "&gt;", 
    '"': "&quot;", 
    "'": "&#39;"
  }[s]));
}

function truncate(text, n) {
  if (!text) return "";
  return text.length > n ? text.slice(0, n - 1) + "…" : text;
}

// ========================================
// FUNCIÓN PRINCIPAL: CARGAR BLOGS
// ========================================
async function cargarBlogs() {
  console.log('🔧 Configuración:');
  console.log('   API_URL:', API_URL);
  console.log('   API_BASE:', API_BASE);
  console.log('   Usuario:', nombreUsuario);
  
  const contenedorBlogs = document.querySelector('.contenido');
  
  if (!contenedorBlogs) {
    console.error('❌ Contenedor de blogs no encontrado');
    return;
  }

  // ✅ Mensaje de carga
  contenedorBlogs.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <p style="font-size: 1.2rem; color: #666;">⏳ Cargando blogs...</p>
    </div>
  `;

  try {
    const url = `${API_URL}/blogs`;
    console.log('📖 Cargando blogs desde:', url);
    
    // Obtener blogs desde la API
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const blogs = await response.json();
    console.log(`✅ ${blogs.length} blogs cargados:`, blogs);
    
    // ✅ VALIDACIÓN
    if (!Array.isArray(blogs) || blogs.length === 0) {
      contenedorBlogs.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <p style="font-size: 1.2rem; color: #666;">📝 No hay blogs disponibles.</p>
          <a href="CrearBlog.html" style="display: inline-block; margin-top: 1rem; padding: 0.8rem 1.5rem; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
            Crear el primer blog
          </a>
        </div>
      `;
      return;
    }
    
    // ✅ RENDERIZAR BLOGS
    contenedorBlogs.innerHTML = blogs.map(blog => {
      const blogId = blog._id;
      
      // Formatear fecha
      const fecha = new Date(blog.fecha).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      
      // ✅ CONSTRUIR URL DE IMAGEN (como cargarReceta.js)
      let imagenURL = 'img/pri.jpg';
      if (blog.imagen?.almacenadoEn) {
        imagenURL = blog.imagen.almacenadoEn.startsWith('http')
          ? blog.imagen.almacenadoEn
          : `${API_BASE}${blog.imagen.almacenadoEn}`;
      }
      
      // ✅ TRUNCAR CONTENIDO LARGO
      const contenidoCorto = truncate(blog.contenido || 'Sin contenido', 150);
      
      return `
        <div class="tarjeta" data-blog-id="${blogId}">
          <img src="${imagenURL}" 
               alt="${escapeHtml(blog.titulo)}"
               crossorigin="anonymous"
               onerror="this.onerror=null; this.src='img/pri.jpg';"
               style="width: 100%; height: 200px; object-fit: cover;">
          
          <h3>${escapeHtml(blog.titulo)}</h3>
          <p>${escapeHtml(contenidoCorto)}</p>
          
          <div class="descrip">
            <img src="img/user.png" alt="usuario">
            <p>${escapeHtml(blog.autor)}</p>
            <p>${fecha}</p>
          </div>
          
          <!-- Sección de comentarios -->
          <div class="comments-section">
            <div class="comments-header">
              <h4>💬 Comentarios (<span class="comments-count">0</span>)</h4>
              <button class="toggle-comments" onclick="toggleComments('${blogId}')">
                Ver comentarios ▼
              </button>
            </div>
            
            <div class="comments-container" id="comments-${blogId}" style="display: none;">
              <div class="comments-list">
                <div class="no-comments">💬 Cargando comentarios...</div>
              </div>
              
              <div class="comment-form">
                <textarea class="comment-input" placeholder="Escribe tu comentario..." maxlength="500"></textarea>
                <div class="comment-actions">
                  <span class="char-count">0/500</span>
                  <button class="btn-comment" onclick="addComment('${blogId}')">
                    Comentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
    
    console.log('✅ Blogs renderizados correctamente');
    
    // ✅ INICIALIZAR SISTEMAS (como cargarReceta.js)
    if (window.favoritosSystem) {
      window.favoritosSystem.setupBookmarks();
      console.log('✅ Sistema de favoritos inicializado');
    }
    
    // ✅ Inicializar contador de caracteres en comentarios
    inicializarContadorCaracteres();
    
  } catch (error) {
    console.error('❌ Error al cargar blogs:', error);
    contenedorBlogs.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #d32f2f; background: #ffebee; border-radius: 8px; margin: 2rem;">
        <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">⚠️ Error al cargar los blogs</p>
        <p style="font-size: 0.9rem; color: #666;">${escapeHtml(error.message)}</p>
        <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.6rem 1.2rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.95rem;">
          🔄 Reintentar
        </button>
      </div>
    `;
  }
}

// ========================================
// FUNCIONES DE COMENTARIOS
// ========================================
function toggleComments(blogId) {
  const container = document.getElementById(`comments-${blogId}`);
  const button = container.previousElementSibling.querySelector('.toggle-comments');
  
  if (container.style.display === 'none') {
    container.style.display = 'block';
    button.textContent = 'Ocultar comentarios ▲';
    
    // Cargar comentarios si no se han cargado
    const commentsList = container.querySelector('.comments-list');
    if (commentsList.querySelector('.no-comments')) {
      cargarComentarios(blogId);
    }
  } else {
    container.style.display = 'none';
    button.textContent = 'Ver comentarios ▼';
  }
}

async function cargarComentarios(blogId) {
  const commentsList = document.querySelector(`#comments-${blogId} .comments-list`);
  
  try {
    const response = await fetch(`${API_URL}/comentariosBlog?blogId=${blogId}`);
    if (!response.ok) throw new Error('Error al cargar comentarios');
    
    const comentarios = await response.json();
    
    if (comentarios.length === 0) {
      commentsList.innerHTML = '<p style="font-style:italic; color:#666;">No hay comentarios. Sé el primero en comentar.</p>';
    } else {
      commentsList.innerHTML = comentarios.map(c => `
        <div class="comment-item">
          <p><strong>${escapeHtml(c.autor || 'Anónimo')}</strong></p>
          <p>${escapeHtml(c.contenido)}</p>
          <small>${new Date(c.fecha).toLocaleDateString()}</small>
        </div>
      `).join('');
      
      // Actualizar contador
      const countSpan = document.querySelector(`#comments-${blogId}`).closest('.comments-section').querySelector('.comments-count');
      if (countSpan) countSpan.textContent = comentarios.length;
    }
  } catch (error) {
    console.error('❌ Error al cargar comentarios:', error);
    commentsList.innerHTML = '<p style="color:#d32f2f;">Error al cargar comentarios</p>';
  }
}

function addComment(blogId) {
  const container = document.getElementById(`comments-${blogId}`);
  const textarea = container.querySelector('.comment-input');
  const commentsList = container.querySelector('.comments-list');
  const countSpan = container.closest('.comments-section').querySelector('.comments-count');
  
  const text = textarea.value.trim();
  
  if (text === "") {
    alert("Escribe un comentario antes de publicar.");
    return;
  }
  
  // Aquí deberías enviar el comentario al backend
  // Por ahora, solo lo agregamos localmente
  const nuevoComentario = document.createElement("div");
  nuevoComentario.className = "comment-item";
  nuevoComentario.innerHTML = `
    <p><strong>${escapeHtml(nombreUsuario)}</strong></p>
    <p>${escapeHtml(text)}</p>
    <small>${new Date().toLocaleDateString()}</small>
  `;
  
  commentsList.appendChild(nuevoComentario);
  
  // Actualizar contador
  if (countSpan) {
    const currentCount = parseInt(countSpan.textContent) || 0;
    countSpan.textContent = currentCount + 1;
  }
  
  // Limpiar textarea
  textarea.value = "";
  
  // Actualizar contador de caracteres
  const charCount = container.querySelector('.char-count');
  if (charCount) charCount.textContent = '0/500';
}

// ✅ INICIALIZAR CONTADOR DE CARACTERES
function inicializarContadorCaracteres() {
  const textareas = document.querySelectorAll('.comment-input');
  
  textareas.forEach(textarea => {
    textarea.addEventListener('input', function() {
      const charCount = this.closest('.comment-form').querySelector('.char-count');
      if (charCount) {
        charCount.textContent = `${this.value.length}/500`;
      }
    });
  });
}

// ========================================
// INICIALIZACIÓN AUTOMÁTICA
// ========================================
document.addEventListener("DOMContentLoaded", async () => {
  await cargarBlogs();
});

// ✅ EXPORTAR FUNCIÓN
if (typeof window !== 'undefined') {
  window.cargarBlogs = cargarBlogs;
  window.toggleComments = toggleComments;
  window.addComment = addComment;
}
