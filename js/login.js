document.addEventListener("DOMContentLoaded", () => {
  // Usar la configuración global de config.js en lugar de hardcodear
  const API_URL = 'https://backend-vjgm.onrender.com/api';
  const API_BASE = 'https://backend-vjgm.onrender.com';
  
  const form = document.querySelector("form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const submitButton = document.getElementById("inicio_de_sesion");

  // Verificar si ya hay sesión activa
  if (checkSession()) {
    // Si ya está logueado, redirigir al inicio
    window.location.href = "index.html";
    return;
  }

  // Evento de envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await iniciarSesion();
  });

  /**
   * Función principal de inicio de sesión
   */
  async function iniciarSesion() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Validaciones básicas
    if (!username || !password) {
      mostrarError("Por favor, completa todos los campos");
      return;
    }

    // Deshabilitar botón durante la petición
    submitButton.disabled = true;
    submitButton.value = "Iniciando sesión...";

    try {
      // Buscar usuario en la base de datos - usando API dinámica
      const response = await fetch(`${API_URL}/usuarios/${encodeURIComponent(username)}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Usuario no encontrado");
        }
        throw new Error("Error al conectar con el servidor");
      }

      const usuario = await response.json();

      // Verificar contraseña
      if (usuario.contrasena !== password) {
        throw new Error("Contraseña incorrecta");
      }

      // Login exitoso
      guardarSesion(usuario);
      mostrarExito("¡Inicio de sesión exitoso!");

      // Redirigir después de 1 segundo
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);

    } catch (error) {
      console.error("Error en login:", error);
      mostrarError(error.message);
      
      // Rehabilitar botón
      submitButton.disabled = false;
      submitButton.value = "Iniciar sesión";
    }
  }

  /**
   * Guarda la sesión del usuario en localStorage
   * @param {Object} usuario - Datos del usuario
   */
  function guardarSesion(usuario) {
    const sessionData = {
      nombreUsuario: usuario.nombreUsuario,
      correoElectronico: usuario.correoElectronico,
      imagenPerfil: usuario.imagenPerfil,
      loginTime: new Date().getTime(),
      tipo: usuario.tipo
    };

    // Guardar datos de sesión
    localStorage.setItem('userSession', JSON.stringify(sessionData));

    // Establecer expiración de sesión (24 horas)
    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
    localStorage.setItem('sessionExpiry', expiryTime.toString());

    console.log("✅ Sesión guardada:", sessionData);
  }

  /**
   * Verifica si hay una sesión activa
   * @returns {boolean}
   */
  function checkSession() {
    const userSession = localStorage.getItem('userSession');
    const sessionExpiry = localStorage.getItem('sessionExpiry');

    if (!userSession || !sessionExpiry) {
      return false;
    }

    // Verificar si la sesión ha expirado
    const now = new Date().getTime();
    if (now > parseInt(sessionExpiry)) {
      clearSession();
      return false;
    }

    return true;
  }

  /**
   * Limpia la sesión
   */
  function clearSession() {
    localStorage.removeItem('userSession');
    localStorage.removeItem('sessionExpiry');
  }

  /**
   * Muestra un mensaje de error
   * @param {string} mensaje
   */
  function mostrarError(mensaje) {
    // Eliminar alertas previas
    const alertaPrevia = document.querySelector('.alert');
    if (alertaPrevia) {
      alertaPrevia.remove();
    }

    // Crear alerta de error
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-error';
    alerta.style.cssText = `
      background-color: #f44336;
      color: white;
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
      text-align: center;
      animation: slideIn 0.3s ease;
    `;
    alerta.textContent = `❌ ${mensaje}`;

    // Insertar antes del formulario
    form.parentNode.insertBefore(alerta, form);

    // Eliminar después de 4 segundos
    setTimeout(() => {
      alerta.remove();
    }, 4000);
  }

  /**
   * Muestra un mensaje de éxito
   * @param {string} mensaje
   */
  function mostrarExito(mensaje) {
    // Eliminar alertas previas
    const alertaPrevia = document.querySelector('.alert');
    if (alertaPrevia) {
      alertaPrevia.remove();
    }

    // Crear alerta de éxito
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-success';
    alerta.style.cssText = `
      background-color: #4CAF50;
      color: white;
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
      text-align: center;
      animation: slideIn 0.3s ease;
    `;
    alerta.textContent = `✅ ${mensaje}`;

    // Insertar antes del formulario
    form.parentNode.insertBefore(alerta, form);
  }
});

// CSS para animación (agregar en un <style> o en tu CSS)
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);