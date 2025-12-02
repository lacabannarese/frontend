// Sistema de gestión de sesión
// Verifica si el usuario está autenticado y actualiza los botones de sesión

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay una sesión activa
    const isLoggedIn = checkSession();
    
    // Actualizar todos los botones de sesión en la página
    updateSessionButtons(isLoggedIn);
});

/**
 * Verifica si hay una sesión activa
 * @returns {boolean} true si hay sesión activa, false si no
 */
function checkSession() {
    // Verificar si existe una sesión en localStorage
    const userSession = localStorage.getItem('userSession');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    
    if (!userSession || !sessionExpiry) {
        return false;
    }
    
    // Verificar si la sesión ha expirado
    const now = new Date().getTime();
    if (now > parseInt(sessionExpiry)) {
        // Sesión expirada, limpiar datos
        clearSession();
        return false;
    }
    
    return true;
}

/**
 * Actualiza todos los botones de sesión en la página
 * @param {boolean} isLoggedIn - Estado de la sesión
 */
function updateSessionButtons(isLoggedIn) {
    // Seleccionar todos los enlaces con clase 'login'
    const loginButtons = document.querySelectorAll('a.login');
    
    loginButtons.forEach(button => {
        if (isLoggedIn) {
            // Cambiar a "Cerrar sesión"
            button.textContent = 'Cerrar sesión';
            button.href = '#';
            
            // Agregar evento para cerrar sesión
            button.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        } else {
            // Mostrar "Iniciar | Registrarse" cuando no hay sesión
            button.textContent = 'Iniciar | Registrarse';
            button.href = 'login.html';
        }
    });
}

/**
 * Función para iniciar sesión (debe ser llamada desde el formulario de login)
 * @param {string} username - Nombre de usuario
 */
function login(username) {
    // Guardar datos de sesión
    const userData = {
        username: username,
        loginTime: new Date().getTime()
    };
    
    localStorage.setItem('userSession', JSON.stringify(userData));
    
    // Establecer expiración de sesión (24 horas)
    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
    localStorage.setItem('sessionExpiry', expiryTime.toString());
    
    // Actualizar botones
    updateSessionButtons(true);
    
    // Opcional: redirigir a la página principal
    window.location.href = 'index.html';
}

/**
 * Función para cerrar sesión
 */
function logout() {
    // Mostrar confirmación
    const confirmLogout = confirm('¿Estás seguro de que deseas cerrar sesión?');
    
    if (confirmLogout) {
        // Limpiar sesión
        clearSession();
        
        // Actualizar botones
        updateSessionButtons(false);
        
        // Redirigir a la página de login
        window.location.href = "index.html";
    }
}

/**
 * Limpia todos los datos de sesión
 */
function clearSession() {
    localStorage.removeItem('userSession');
    localStorage.removeItem('sessionExpiry');
}

/**
 * Obtiene información del usuario actual
 * @returns {object|null} Datos del usuario o null si no hay sesión
 */
function getCurrentUser() {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
        try {
            return JSON.parse(userSession);
        } catch (e) {
            console.error('Error parsing user session:', e);
            return null;
        }
    }
    return null;
}

// Exportar funciones para uso en otras páginas
window.authSession = {
    checkSession,
    login,
    logout,
    getCurrentUser,
    updateSessionButtons
};