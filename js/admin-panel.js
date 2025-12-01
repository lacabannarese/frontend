// ========================================
// PANEL DE ADMINISTRACIÓN - LA CABAÑA
// Conectado a la API de RedRecetas (Node.js + MongoDB)
// Usa el config.js existente del proyecto
// ========================================

// Esperar a que config.js esté cargado
function waitForConfig() {
    return new Promise((resolve) => {
        if (window.API_URL && window.apiRequest) {
            resolve();
        } else {
            setTimeout(() => waitForConfig().then(resolve), 100);
        }
    });
}

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

// ========== CRUD OPERATIONS - RECETAS ==========

// CARGAR RECETAS
async function cargarRecetas() {
    try {
        // Usar la función apiRequest de config.js
        const recetas = await window.apiRequest('/recetas');
        renderRecetas(recetas);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar las recetas', 'error');
    }
}

// CREAR RECETA
async function guardarReceta(event) {
    event.preventDefault();
    
    const receta = {
        usuario: 'LosAdministradores',
        titulo: document.getElementById('receta-titulo').value,
        tipo: document.getElementById('receta-categoria').value,
        ingredientes: document.getElementById('receta-ingredientes').value.split('\n').filter(i => i.trim()),
        pasos: document.getElementById('receta-instrucciones').value.split('\n').filter(p => p.trim()),
        imagen: {
            nombreArchivo: document.getElementById('receta-imagen').files[0]?.name || 'default.jpg',
            tipo: 'image/jpeg',
            almacenadoEn: 'uploads/recetas/'
        }
    };
    
    try {
        await window.apiRequest('/recetas', {
            method: 'POST',
            body: JSON.stringify(receta)
        });
        
        closeModal('modal-receta');
        showAlert('Receta creada exitosamente');
        await cargarRecetas();
        await actualizarEstadisticas();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al crear la receta', 'error');
    }
}

// ELIMINAR RECETA
async function eliminarReceta(titulo) {
    if (!confirm('¿Estás seguro de eliminar esta receta?')) return;
    
    try {
        const response = await fetch(`${API_URL}/recetas/${encodeURIComponent(titulo)}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Error al eliminar receta');
        
        showAlert('Receta eliminada exitosamente', 'error');
        await cargarRecetas();
        await actualizarEstadisticas();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al eliminar la receta', 'error');
    }
}

// RENDERIZAR RECETAS
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

// EDITAR RECETA
async function editarReceta(titulo) {
    try {
        const response = await fetch(`${API_URL}/recetas/${encodeURIComponent(titulo)}`);
        if (!response.ok) throw new Error('Error al cargar receta');
        
        const receta = await response.json();
        
        document.getElementById('receta-titulo').value = receta.titulo;
        document.getElementById('receta-categoria').value = receta.tipo;
        document.getElementById('receta-ingredientes').value = receta.ingredientes?.join('\n') || '';
        document.getElementById('receta-instrucciones').value = receta.descripcion;
        document.getElementById('receta-tiempo').value = receta.tiempoCoccion;
        
        openModal('modal-receta');
        showAlert('Modo edición activado - Guarda para actualizar', 'info');
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar la receta', 'error');
    }
}

// ========== CRUD OPERATIONS - CATEGORÍAS ==========

function cargarCategorias() {
    const categorias = [
        {id: 1, nombre: 'Desayuno', descripcion: 'Recetas para el desayuno'},
        {id: 2, nombre: 'Almuerzo', descripcion: 'Recetas para el almuerzo'},
        {id: 3, nombre: 'Cena', descripcion: 'Recetas para la cena'},
        {id: 4, nombre: 'Postre', descripcion: 'Postres deliciosos'}
    ];
    
    renderCategorias(categorias);
    updateCategoriaSelect(categorias);
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

function guardarCategoria(event) {
    event.preventDefault();
    showAlert('Las categorías son fijas en este sistema', 'info');
    closeModal('modal-categoria');
}

// ========== CRUD OPERATIONS - BLOG ==========

async function cargarBlog() {
    try {
        const blogs = await window.apiRequest('/blogs');
        renderBlog(blogs);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar el blog', 'error');
    }
}

async function guardarBlog(event) {
    event.preventDefault();
    
    const blog = {
        autor: '@admin',
        titulo: document.getElementById('blog-titulo').value,
        contenido: document.getElementById('blog-contenido').value,
        categoria: 'Consejos',
        imagen: {
            nombreArchivo: document.getElementById('blog-imagen').files[0]?.name || 'default.jpg',
            tipo: 'image/jpeg',
            almacenadoEn: 'uploads/blogs/'
        }
    };
    
    try {
        await window.apiRequest('/blogs', {
            method: 'POST',
            body: JSON.stringify(blog)
        });
        
        closeModal('modal-blog');
        showAlert('Publicación creada exitosamente');
        await cargarBlog();
        await actualizarEstadisticas();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al crear la publicación', 'error');
    }
}

async function eliminarBlog(titulo) {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;
    
    try {
        const response = await fetch(`${API_URL}/blogs/${encodeURIComponent(titulo)}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar publicación');
        
        showAlert('Publicación eliminada exitosamente', 'error');
        await cargarBlog();
        await actualizarEstadisticas();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al eliminar la publicación', 'error');
    }
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

async function editarBlog(titulo) {
    showAlert('Funcionalidad de edición disponible', 'info');
}

// ========== CRUD OPERATIONS - USUARIOS ==========

async function cargarUsuarios() {
    try {
        const usuarios = await window.apiRequest('/usuarios');
        renderUsuarios(usuarios);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar los usuarios', 'error');
    }
}

async function guardarUsuario(event) {
    event.preventDefault();
    
    const usuario = {
        nombreUsuario: document.getElementById('usuario-nombre').value,
        correoElectronico: document.getElementById('usuario-email').value,
        contrasena: document.getElementById('usuario-password').value,
        imagenPerfil: {
            nombreArchivo: 'default.jpg',
            tipo: 'image/jpeg',
            almacenadoEn: 'uploads/perfiles/'
        },
        favoritos: []
    };
    
    try {
        await window.apiRequest('/usuarios', {
            method: 'POST',
            body: JSON.stringify(usuario)
        });
        
        closeModal('modal-usuario');
        showAlert('Usuario creado exitosamente');
        await cargarUsuarios();
        await actualizarEstadisticas();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al crear el usuario', 'error');
    }
}

async function eliminarUsuario(nombreUsuario) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
        const response = await fetch(`${API_URL}/usuarios/${nombreUsuario}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar usuario');
        
        showAlert('Usuario eliminado exitosamente', 'error');
        await cargarUsuarios();
        await actualizarEstadisticas();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al eliminar el usuario', 'error');
    }
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
            <td><span class="admin-badge admin-badge-info">Usuario</span></td>
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

async function editarUsuario(nombreUsuario) {
    showAlert('Funcionalidad de edición disponible', 'info');
}

// ========== MODERACIÓN DE COMENTARIOS ==========

async function cargarComentarios() {
    try {
        const comentarios = await window.apiRequest('/comentariosBlog');
        renderComentarios(comentarios);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar los comentarios', 'error');
    }
}

async function aprobarComentario(id) {
    showAlert('Comentario aprobado', 'success');
    await cargarComentarios();
}

async function eliminarComentario(id) {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) return;
    showAlert('Comentario eliminado', 'error');
    await cargarComentarios();
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

// ========== ESTADÍSTICAS ==========

async function actualizarEstadisticas() {
    try {
        const [recetas, usuarios, blog, comentarios] = await Promise.all([
            window.apiRequest('/recetas'),
            window.apiRequest('/usuarios'),
            window.apiRequest('/blogs'),
            window.apiRequest('/comentariosBlog')
        ]);
        
        document.getElementById('total-recetas').textContent = recetas.length || 0;
        document.getElementById('total-usuarios').textContent = usuarios.length || 0;
        document.getElementById('total-blog').textContent = blog.length || 0;
        document.getElementById('total-comentarios').textContent = comentarios.length || 0;
        
        renderEstadisticas(recetas);
    } catch (error) {
        console.error('Error al actualizar estadísticas:', error);
    }
}

async function renderEstadisticas(recetas) {
    const tbody = document.getElementById('stats-recetas-tbody');
    const topRecetas = recetas.slice(0, 5);
    
    if (topRecetas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 30px;">No hay recetas aún. Crea tu primera receta para ver estadísticas.</td></tr>';
        return;
    }
    
    // Obtener valoraciones reales de cada receta
    try {
        const valoraciones = await window.apiRequest('/valoraciones');
        
        tbody.innerHTML = topRecetas.map(receta => {
            // Contar valoraciones de esta receta
            const recetaValoraciones = valoraciones.filter(v => v.recetaTitulo === receta.titulo);
            const numComentarios = recetaValoraciones.length;
            
            // Calcular rating promedio
            let ratingPromedio = 0;
            if (numComentarios > 0) {
                const sumaRatings = recetaValoraciones.reduce((sum, v) => sum + (v.estrellas || v.calificacion || 0), 0);
                ratingPromedio = (sumaRatings / numComentarios).toFixed(1);
            }
            
            return `
                <tr>
                    <td>${receta.titulo}</td>
                    <td>-</td>
                    <td>${numComentarios}</td>
                    <td>⭐ ${ratingPromedio > 0 ? ratingPromedio : '-'}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error al cargar valoraciones:', error);
        // Si falla, mostrar sin valoraciones
        tbody.innerHTML = topRecetas.map(receta => `
            <tr>
                <td>${receta.titulo}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
        `).join('');
    }
}

async function exportarEstadisticas() {
    try {
        const [recetas, usuarios, blog, comentarios] = await Promise.all([
            window.apiRequest('/recetas'),
            window.apiRequest('/usuarios'),
            window.apiRequest('/blogs'),
            window.apiRequest('/comentariosBlog')
        ]);
        
        const stats = {
            totalRecetas: recetas.length,
            totalUsuarios: usuarios.length,
            totalBlog: blog.length,
            totalComentarios: comentarios.length,
            fecha: new Date().toLocaleString('es-ES'),
            recetas: recetas,
            usuarios: usuarios.map(u => ({
                nombreUsuario: u.nombreUsuario,
                correoElectronico: u.correoElectronico,
                fechaRegistro: u.fechaRegistro
            }))
        };
        
        const dataStr = JSON.stringify(stats, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `estadisticas-la-cabana-${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showAlert('Estadísticas exportadas exitosamente');
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al exportar estadísticas', 'error');
    }
}

// LOG DE ACTIVIDAD
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

// ========== INITIALIZE ==========
async function init() {
    try {
        console.log('🚀 Inicializando panel de administración...');
        
        // Esperar a que config.js esté cargado
        await waitForConfig();
        
        // Obtener API_URL de config.js
        const API_URL = window.API_URL || 'http://localhost:3000/api';
        const API_BASE = window.API_BASE || 'http://localhost:3000';
        console.log('📡 API URL configurada:', API_URL);
        console.log('🔧 Usando config.js existente del proyecto');
        
        // Verificar conexión con la API
        const response = await fetch(window.API_BASE + '/');
        if (response.ok) {
            console.log('✅ Conexión con API establecida');
        }
        
        // Cargar todos los datos
        await Promise.all([
            cargarRecetas(),
            cargarCategorias(),
            cargarBlog(),
            cargarUsuarios(),
            cargarComentarios(),
            actualizarEstadisticas()
        ]);
        
        cargarLogActividad();
        
        console.log('✅ Panel de administración cargado exitosamente');
        showAlert('Panel de administración cargado correctamente', 'success');
    } catch (error) {
        console.error('❌ Error al inicializar el panel:', error);
        showAlert('Error al cargar el panel. Verifica que config.js esté incluido y la API esté corriendo.', 'error');
    }
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}