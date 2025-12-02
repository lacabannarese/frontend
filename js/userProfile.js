/**
 * Sistema de Perfil de Usuario
 * Este script se encarga de mostrar y actualizar los datos del usuario en toda la aplicación
 */

// Función para obtener la sesión actual
function obtenerSesion() {
  const rawSession = localStorage.getItem('userSession');
  return rawSession ? JSON.parse(rawSession) : null;
}

// Función para actualizar elementos de usuario en la página
function actualizarElementosUsuario() {
  const session = obtenerSesion();
  const API_BASE = 'https://backend-vjgm.onrender.com';
  
  if (!session || !session.nombreUsuario) {
    console.log('ℹ️ No hay sesión activa');
    return;
  }
  
  console.log('👤 Actualizando elementos de usuario:', session.nombreUsuario);
  
  // 1. Actualizar nombre de usuario en todos los elementos con clase .user-name
  const elementosNombre = document.querySelectorAll('.user-name, [data-user-name]');
  elementosNombre.forEach(el => {
    el.textContent = session.nombreUsuario;
  });
  
  // 2. Actualizar email en elementos con clase .user-email
  const elementosEmail = document.querySelectorAll('.user-email, [data-user-email]');
  elementosEmail.forEach(el => {
    el.textContent = session.correoElectronico || '';
  });
  
  // 3. Actualizar imágenes de perfil
  if (session.imagenPerfil?.almacenadoEn) {
    const imagenURL = session.imagenPerfil.almacenadoEn.startsWith('http')
      ? session.imagenPerfil.almacenadoEn
      : `${API_BASE}${session.imagenPerfil.almacenadoEn}`;
    
    const elementosImagen = document.querySelectorAll('.user-avatar, .user-profile-image, [data-user-avatar]');
    elementosImagen.forEach(img => {
      img.src = imagenURL;
      img.alt = `Perfil de ${session.nombreUsuario}`;
    });
    
    console.log('🖼️ Imágenes de perfil actualizadas:', imagenURL);
  }
  
  // 4. Actualizar links de perfil
  const linksEditar = document.querySelectorAll('[data-edit-profile]');
  linksEditar.forEach(link => {
    link.href = 'CambioPerfil.html';
  });
  
  // 5. Mostrar/ocultar elementos según estado de sesión
  const elementosSesion = document.querySelectorAll('[data-require-auth]');
  elementosSesion.forEach(el => {
    el.style.display = 'block';
  });
  
  const elementosNoSesion = document.querySelectorAll('[data-require-no-auth]');
  elementosNoSesion.forEach(el => {
    el.style.display = 'none';
  });
}

// Función para crear un widget de perfil de usuario
function crearWidgetPerfil(contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;
  
  const session = obtenerSesion();
  const API_BASE = window.API_BASE || 'http://localhost:3000';
  
  if (!session) {
    contenedor.innerHTML = `
      <div class="user-widget">
        <p>No has iniciado sesión</p>
        <a href="login.html" class="btn-login">Iniciar Sesión</a>
      </div>
    `;
    return;
  }
  
  const imagenURL = session.imagenPerfil?.almacenadoEn
    ? (session.imagenPerfil.almacenadoEn.startsWith('http')
        ? session.imagenPerfil.almacenadoEn
        : `${API_BASE}${session.imagenPerfil.almacenadoEn}`)
    : 'img/perfil.jpg';
  
  contenedor.innerHTML = `
    <div class="user-widget">
      <img src="${imagenURL}" alt="${session.nombreUsuario}" class="widget-avatar">
      <div class="widget-info">
        <strong>${session.nombreUsuario}</strong>
        <p>${session.correoElectronico}</p>
      </div>
      <div class="widget-actions">
        <a href="CambioPerfil.html" class="btn-edit">✏️ Editar</a>
        <button onclick="cerrarSesion()" class="btn-logout">🚪 Salir</button>
      </div>
    </div>
  `;
}

// Función para cerrar sesión
function cerrarSesion() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('userSession');
    window.location.href = 'index.html';
  }
}

// Función para refrescar datos del usuario desde el servidor
async function refrescarDatosUsuario() {
  const session = obtenerSesion();
  if (!session || !session.nombreUsuario) return;
  
  try {
    const API_URL = window.API_URL || 'http://localhost:3000/api';
    console.log('🔄 Refrescando datos del usuario...');
    
    const response = await fetch(`${API_URL}/usuarios/${session.nombreUsuario}`);
    
    if (!response.ok) {
      throw new Error('Usuario no encontrado');
    }
    
    const usuarioActualizado = await response.json();
    
    // Actualizar sesión local
    const nuevaSesion = {
      nombreUsuario: usuarioActualizado.nombreUsuario,
      correoElectronico: usuarioActualizado.correoElectronico,
      imagenPerfil: usuarioActualizado.imagenPerfil,
      fechaRegistro: usuarioActualizado.fechaRegistro
    };
    
    localStorage.setItem('userSession', JSON.stringify(nuevaSesion));
    console.log('✅ Datos del usuario actualizados');
    
    // Actualizar UI
    actualizarElementosUsuario();
    
    return usuarioActualizado;
  } catch (error) {
    console.error('❌ Error al refrescar datos:', error);
    return null;
  }
}

// Función helper para verificar si el usuario está autenticado
function estaAutenticado() {
  const session = obtenerSesion();
  return session && session.nombreUsuario;
}

// Función para redirigir si no está autenticado
function requiereAutenticacion(redirectUrl = 'login.html') {
  if (!estaAutenticado()) {
    alert('⚠️ Debes iniciar sesión para acceder a esta página');
    window.location.href = redirectUrl;
    return false;
  }
  return true;
}

// Inicialización automática cuando se carga el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    actualizarElementosUsuario();
  });
} else {
  actualizarElementosUsuario();
}

// Escuchar cambios en localStorage (cuando se actualiza en otra pestaña)
window.addEventListener('storage', (e) => {
  if (e.key === 'userSession') {
    console.log('🔄 Sesión actualizada desde otra pestaña');
    actualizarElementosUsuario();
  }
});

// Exportar funciones para uso global
window.userProfile = {
  obtenerSesion,
  actualizarElementosUsuario,
  crearWidgetPerfil,
  cerrarSesion,
  refrescarDatosUsuario,
  estaAutenticado,
  requiereAutenticacion
};