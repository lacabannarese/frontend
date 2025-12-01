// ========================================
// ADMIN-UI.JS - FUNCIONALIDAD VISUAL/UI
// Navegación, modales, alerts, renderizado de tablas
// ========================================

// ========== NAVEGACIÓN ==========
function showSection(sectionId) {
    document.querySelectorAll('.admin-content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.admin-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    event.target.closest('.admin-menu-item').classList.add('active');
}

// ========== MODAL FUNCTIONS ==========
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    const form = document.querySelector(`#${modalId} form`);
    if (form) form.reset();
    document.querySelectorAll('.admin-image-preview').forEach(img => {
        img.style.display = 'none';
    });
}

// ========== IMAGE PREVIEW ==========
function previewImage(event, previewId) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(previewId);
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// ========== ALERT FUNCTION ==========
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('admin-alert-container');
    const alert = document.createElement('div');
    alert.className = `admin-alert admin-alert-${type} show`;
    alert.textContent = message;
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// ========== SEARCH TABLE ==========
function searchTable(tableId, query) {
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    for (let row of rows) {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    }
}

// ========== RENDER FUNCTIONS ==========

function renderRecetas(recetas) {
    const tbody = document.getElementById('recetas-tbody');
    
    if (!recetas || recetas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">No hay recetas registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = recetas.map(receta => `
        <tr>
            <td>${receta._id?.toString().slice(-6) || 'N/A'}</td>
            <td>${receta.titulo}</td>
            <td>${receta.tipo}</td>
            <td><span class="admin-badge admin-badge-success">Publicada</span></td>
            <td>
                <div class="admin-action-buttons">
                    <button class="admin-btn admin-btn-small admin-btn-primary" onclick="editarReceta('${receta.titulo.replace(/'/g, "\\'")}')">✏️ Editar</button>
                    <button class="admin-btn admin-btn-small admin-btn-danger" onclick="eliminarReceta('${receta.titulo.replace(/'/g, "\\'")}')">🗑️ Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderCategorias(categorias) {
    const tbody = document.getElementById('categorias-tbody');
    
    tbody.innerHTML = categorias.map(cat => `
        <tr>
            <td>${cat.id}</td>
            <td>${cat.nombre}</td>
            <td>-</td>
            <td>
                <div class="admin-action-buttons">
                    <span class="admin-badge admin-badge-info">Categoría fija</span>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateCategoriaSelect(categorias) {
    const select = document.getElementById('receta-categoria');
    select.innerHTML = '<option value="">Seleccionar categoría</option>' + 
        categorias.map(cat => `<option value="${cat.nombre}">${cat.nombre}</option>`).join('');
}

function renderBlog(posts) {
    const tbody = document.getElementById('blog-tbody');
    
    if (!posts || posts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">No hay publicaciones</td></tr>';
        return;
    }
    
    tbody.innerHTML = posts.map(post => `
        <tr>
            <td>${post._id?.toString().slice(-6) || 'N/A'}</td>
            <td>${post.titulo}</td>
            <td>${post.autor}</td>
            <td>${new Date(post.fechaPublicacion).toLocaleDateString('es-ES')}</td>
            <td><span class="admin-badge admin-badge-success">Publicado</span></td>
            <td>
                <div class="admin-action-buttons">
                    <button class="admin-btn admin-btn-small admin-btn-primary" onclick="editarBlog('${post.titulo.replace(/'/g, "\\'")}')">✏️ Editar</button>
                    <button class="admin-btn admin-btn-small admin-btn-danger" onclick="eliminarBlog('${post.titulo.replace(/'/g, "\\'")}')">🗑️ Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderUsuarios(usuarios) {
    const tbody = document.getElementById('usuarios-tbody');
    
    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">No hay usuarios registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = usuarios.map(user => `
        <tr>
            <td>${user._id?.toString().slice(-6) || 'N/A'}</td>
            <td>${user.nombreUsuario}</td>
            <td>${user.correoElectronico}</td>
            <td>>${user.tipo}</td>
            <td><span class="admin-badge admin-badge-success">Activo</span></td>
            <td>
                <div class="admin-action-buttons">
                    <button class="admin-btn admin-btn-small admin-btn-primary" onclick="editarUsuario('${user.nombreUsuario}')">✏️ Editar</button>
                    <button class="admin-btn admin-btn-small admin-btn-danger" onclick="eliminarUsuario('${user.nombreUsuario}')">🗑️ Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderComentarios(comentarios) {
    const tbody = document.getElementById('comentarios-tbody');
    
    if (!comentarios || comentarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">No hay comentarios pendientes</td></tr>';
        return;
    }
    
    tbody.innerHTML = comentarios.map(com => `
        <tr>
            <td>${com._id?.toString().slice(-6) || 'N/A'}</td>
            <td>${com.usuario}</td>
            <td>${com.texto}</td>
            <td>${com.blogTitulo}</td>
            <td>${new Date(com.fecha).toLocaleDateString('es-ES')}</td>
            <td>
                <div class="admin-action-buttons">
                    <button class="admin-btn admin-btn-small admin-btn-success" onclick="aprobarComentario('${com._id}')">✓ Aprobar</button>
                    <button class="admin-btn admin-btn-small admin-btn-danger" onclick="eliminarComentario('${com._id}')">✗ Rechazar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ========== LOG DE ACTIVIDAD ==========
function cargarLogActividad() {
    const logContainer = document.getElementById('log-container');
    const now = new Date().toLocaleString('es-ES');
    logContainer.innerHTML = `
        <div class="admin-log-entry">
            <strong>${now}</strong> - Sistema iniciado: Panel de administración cargado
        </div>
        <div class="admin-log-entry">
            <strong>${now}</strong> - Base de datos conectada: MongoDB RedRecetas
        </div>
        <div class="admin-log-entry">
            <strong>${now}</strong> - Configuración cargada: ${window.location.hostname === 'localhost' ? 'Modo LOCAL' : 'Modo RED'}
        </div>
    `;
}

// ========== INITIALIZE UI ==========
async function initUI() {
    try {
        console.log('🎨 Inicializando interfaz de usuario...');
        
        // Cargar log de actividad
        cargarLogActividad();
        
        console.log('✅ Interfaz cargada exitosamente');
    } catch (error) {
        console.error('❌ Error al inicializar interfaz:', error);
    }
}

// ========== MAIN INIT ==========
async function init() {
    try {
        console.log('🚀 Inicializando panel de administración...');
        
        // Inicializar UI primero
        await initUI();
        
        // Luego cargar datos de la base de datos
        await initDatabase();
        
        console.log('✅ Panel de administración cargado completamente');
    } catch (error) {
        console.error('❌ Error al inicializar el panel:', error);
        showAlert('Error al cargar el panel. Verifica la configuración.', 'error');
    }
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}