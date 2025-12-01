// Sistema de comentarios para Blog de Consejos
// Versión con integración a MongoDB

document.addEventListener('DOMContentLoaded', function() {
    // Obtener configuración de API
      const API_URL = 'https://backend-vjgm.onrender.com/api';
      const API_BASE = 'https://backend-vjgm.onrender.com';
  
    console.log('🔧 Sistema de comentarios inicializado');
    console.log('   API_URL:', API_URL);
    
    loadAllComments();
    setupCharCounters();
    checkAuthForComments();
});

function getAPIUrl() {
    return window.API_URL || 'http://localhost:3000/api';
}

function checkAuthForComments() {
    const session = localStorage.getItem('userSession');
    const isLoggedIn = !!session;
    
    const commentForms = document.querySelectorAll('.comment-form');
    
    commentForms.forEach(form => {
        const textarea = form.querySelector('.comment-input');
        const button = form.querySelector('.btn-comment');
        
        if (!isLoggedIn) {
            textarea.disabled = true;
            textarea.placeholder = 'Debes iniciar sesión para comentar...';
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        } else {
            textarea.disabled = false;
            textarea.placeholder = 'Escribe tu comentario...';
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
    });
}

function setupCharCounters() {
    const textareas = document.querySelectorAll('.comment-input');
    
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            const charCount = this.value.length;
            const counter = this.closest('.comment-form').querySelector('.char-count');
            if (counter) {
                counter.textContent = `${charCount}/500`;
                
                if (charCount > 450) {
                    counter.style.color = '#e74c3c';
                } else if (charCount > 400) {
                    counter.style.color = '#f39c12';
                } else {
                    counter.style.color = '#666';
                }
            }
        });
    });
}

function toggleComments(blogId) {
    const commentsContainer = document.getElementById(`comments-${blogId}`);
    const toggleButton = event.target;
    
    if (!commentsContainer) {
        console.error('❌ No se encontró el contenedor de comentarios para blog:', blogId);
        return;
    }
    
    if (commentsContainer.style.display === 'none') {
        commentsContainer.style.display = 'block';
        toggleButton.textContent = 'Ocultar comentarios ▲';
        toggleButton.classList.add('active');
        loadComments(blogId);
    } else {
        commentsContainer.style.display = 'none';
        toggleButton.textContent = 'Ver comentarios ▼';
        toggleButton.classList.remove('active');
    }
}

async function addComment(blogId) {
    const session = localStorage.getItem('userSession');
    
    if (!session) {
        showNotification('⚠️ Debes iniciar sesión para comentar', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    const user = JSON.parse(session);
    const card = document.querySelector(`[data-blog-id="${blogId}"]`);
    
    if (!card) {
        console.error('❌ No se encontró la tarjeta del blog:', blogId);
        return;
    }
    
    const textarea = card.querySelector('.comment-input');
    const commentText = textarea.value.trim();
    
    if (!commentText) {
        showNotification('⚠️ El comentario no puede estar vacío', 'warning');
        textarea.focus();
        return;
    }
    
    if (commentText.length > 500) {
        showNotification('⚠️ El comentario es demasiado largo (máximo 500 caracteres)', 'warning');
        return;
    }
    
    const blogTitulo = card.querySelector('.blog-title')?.textContent || 
                       card.getAttribute('data-blog-titulo') || 
                       `Blog ${blogId}`;
    
    console.log('📝 Enviando comentario:', {
        blogTitulo,
        usuario: user.nombreUsuario,
        texto: commentText
    });
    
    const button = card.querySelector('.btn-comment');
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Publicando...';
    
    try {
        const API_URL = getAPIUrl();
        const response = await fetch(`${API_URL}/comentariosBlog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                blogTitulo: blogTitulo,
                usuario: user.nombreUsuario,
                texto: commentText,
                fecha: new Date()
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al publicar comentario');
        }
        
        const data = await response.json();
        console.log('✅ Comentario publicado:', data);
        
        textarea.value = '';
        const charCounter = card.querySelector('.char-count');
        if (charCounter) {
            charCounter.textContent = '0/500';
            charCounter.style.color = '#666';
        }
        
        await loadComments(blogId);
        
        showNotification('✓ Comentario publicado exitosamente', 'success');
        
    } catch (error) {
        console.error('❌ Error al publicar comentario:', error);
        showNotification('✗ ' + error.message, 'error');
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

async function loadComments(blogId) {
    try {
        const card = document.querySelector(`[data-blog-id="${blogId}"]`);
        
        if (!card) {
            console.error('❌ No se encontró la tarjeta del blog:', blogId);
            return;
        }
        
        const blogTitulo = card.querySelector('.blog-title')?.textContent || 
                          card.getAttribute('data-blog-titulo') || 
                          `Blog ${blogId}`;
        
        console.log('📖 Cargando comentarios para:', blogTitulo);
        
        const API_URL = getAPIUrl();
        const response = await fetch(`${API_URL}/comentariosBlog/${encodeURIComponent(blogTitulo)}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar comentarios');
        }
        
        const comentarios = await response.json();
        console.log(`✅ ${comentarios.length} comentarios cargados`);
        
        const commentsList = document.querySelector(`#comments-${blogId} .comments-list`);
        const commentsCount = document.querySelector(`[data-blog-id="${blogId}"] .comments-count`);
        
        if (commentsCount) {
            commentsCount.textContent = comentarios.length;
        }
        
        if (commentsList) {
            commentsList.innerHTML = '';
            
            if (comentarios.length === 0) {
                commentsList.innerHTML = '<p class="no-comments">No hay comentarios aún. ¡Sé el primero en comentar!</p>';
                return;
            }
            
            comentarios.forEach(comment => {
                const commentElement = createCommentElement(comment, blogId);
                commentsList.appendChild(commentElement);
            });
        }
        
    } catch (error) {
        console.error('❌ Error al cargar comentarios:', error);
        const commentsList = document.querySelector(`#comments-${blogId} .comments-list`);
        if (commentsList) {
            commentsList.innerHTML = '<p class="no-comments error">Error al cargar comentarios. Intenta de nuevo más tarde.</p>';
        }
    }
}

async function loadAllComments() {
    const cards = document.querySelectorAll('[data-blog-id]');
    console.log(`📚 Cargando comentarios para ${cards.length} blogs`);
    
    for (const card of cards) {
        const blogId = parseInt(card.getAttribute('data-blog-id'));
        await loadComments(blogId);
    }
}

function createCommentElement(comment, blogId) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.setAttribute('data-comment-id', comment._id);
    
    const date = new Date(comment.fecha);
    const formattedDate = formatDate(date);
    
    const session = localStorage.getItem('userSession');
    const currentUser = session ? JSON.parse(session) : null;
    const isOwnComment = currentUser && currentUser.nombreUsuario === comment.usuario;
    
    div.innerHTML = `
        <div class="comment-header">
            <div class="comment-user">
                <span class="comment-avatar">👤</span>
                <span class="comment-username">${escapeHtml(comment.usuario)}</span>
                ${isOwnComment ? '<span class="own-badge">Tú</span>' : ''}
            </div>
            <span class="comment-date">${formattedDate}</span>
        </div>
        <p class="comment-text">${escapeHtml(comment.texto)}</p>
        ${isOwnComment ? `
        <div class="comment-actions-bottom">
            <button class="btn-delete" onclick="deleteComment('${comment._id}', ${blogId})">🗑️ Eliminar</button>
        </div>
        ` : ''}
    `;
    
    return div;
}

async function deleteComment(commentId, blogId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
        return;
    }
    
    try {
        const API_URL = getAPIUrl();
        const response = await fetch(`${API_URL}/comentariosBlog/${commentId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al eliminar comentario');
        }
        
        await loadComments(blogId);
        showNotification('✓ Comentario eliminado', 'success');
        
    } catch (error) {
        console.error('❌ Error al eliminar comentario:', error);
        showNotification('✗ Error al eliminar el comentario', 'error');
    }
}

function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    if (days < 7) return `Hace ${days} día${days !== 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 15px 25px;
        border-radius: 10px;
        font-size: 1em;
        font-weight: 500;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = '#d4edda';
            notification.style.color = '#155724';
            break;
        case 'error':
            notification.style.background = '#f8d7da';
            notification.style.color = '#721c24';
            break;
        case 'warning':
            notification.style.background = '#fff3cd';
            notification.style.color = '#856404';
            break;
        default:
            notification.style.background = '#d1ecf1';
            notification.style.color = '#0c5460';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Exportar funciones globales
window.toggleComments = toggleComments;
window.addComment = addComment;
window.deleteComment = deleteComment;