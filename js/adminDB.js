// ========================================
// ADMIN-DB.JS - FUNCIONALIDAD DE BASE DE DATOS
// Todas las operaciones CRUD y llamadas a la API
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

    const API_URL = 'https://backend-vjgm.onrender.com/api';
    const API_BASE = 'https://backend-vjgm.onrender.com';
// ========== CRUD OPERATIONS - RECETAS ==========

async function cargarRecetas() {
    try {
        const recetas = await window.apiRequest('/recetas');
        renderRecetas(recetas);
        return recetas;
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar las recetas', 'error');
        return [];
    }
}

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
    return categorias;
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
        return blogs;
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar el blog', 'error');
        return [];
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

async function editarBlog(titulo) {
    showAlert('Funcionalidad de edición disponible', 'info');
}

// ========== CRUD OPERATIONS - USUARIOS ==========

async function cargarUsuarios() {
    try {
        const usuarios = await window.apiRequest('/usuarios');
        renderUsuarios(usuarios);
        return usuarios;
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar los usuarios', 'error');
        return [];
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

async function editarUsuario(nombreUsuario) {
    showAlert('Funcionalidad de edición disponible', 'info');
}

// ========== MODERACIÓN DE COMENTARIOS ==========

async function cargarComentarios() {
    try {
        const comentarios = await window.apiRequest('/comentariosBlog');
        renderComentarios(comentarios);
        return comentarios;
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al cargar los comentarios', 'error');
        return [];
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
    
    try {
        const valoraciones = await window.apiRequest('/valoraciones');
        
        tbody.innerHTML = topRecetas.map(receta => {
            const recetaValoraciones = valoraciones.filter(v => v.recetaTitulo === receta.titulo);
            const numComentarios = recetaValoraciones.length;
            
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

// ========== INITIALIZE DATABASE ==========
async function initDatabase() {
    try {
        console.log('🚀 Inicializando conexión con base de datos...');
        
        await waitForConfig();
        
        console.log('📡 API URL configurada:', window.API_URL);
        
        const response = await fetch(window.API_BASE + '/');
        if (response.ok) {
            console.log('✅ Conexión con API establecida');
        }
        
        await Promise.all([
            cargarRecetas(),
            cargarCategorias(),
            cargarBlog(),
            cargarUsuarios(),
            cargarComentarios(),
            actualizarEstadisticas()
        ]);
        
        console.log('✅ Datos cargados exitosamente');
        showAlert('Datos cargados correctamente', 'success');
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        showAlert('Error al cargar datos. Verifica que la API esté corriendo.', 'error');
    }
}
