document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = 'https://backend-vjgm.onrender.com/api';
  const API_BASE = 'https://backend-vjgm.onrender.com';
  
  console.log('🔧 Configuración API:');
  console.log('   API_URL:', API_URL);
  console.log('   API_BASE:', API_BASE);
  
  const form = document.querySelector(".profile-form");
  const profileImageInput = document.getElementById("profileImageInput");
  const profilePreview = document.getElementById("profilePreview");
  
  // Obtener sesión actual
  const rawSession = localStorage.getItem('userSession');
  const session = rawSession ? JSON.parse(rawSession) : null;
  
  if (!session || !session.nombreUsuario) {
    alert("⚠️ Debes iniciar sesión para editar tu perfil");
    window.location.href = 'login.html';
    return;
  }
  
  const nombreUsuarioActual = session.nombreUsuario;
  console.log('👤 Usuario actual:', nombreUsuarioActual);
  
  // Cargar datos actuales del usuario
  await cargarDatosUsuario(nombreUsuarioActual);
  
  if (!form) {
    console.error('❌ Formulario no encontrado');
    return;
  }

  // Prevenir submit múltiple
  let isSubmitting = false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if (isSubmitting) {
      console.log('⚠️ Ya hay una petición en curso');
      return;
    }
    isSubmitting = true;
    
    const btnGuardar = form.querySelector('button[type="submit"]');
    const textoOriginal = btnGuardar.textContent;
    btnGuardar.disabled = true;
    btnGuardar.textContent = '⏳ Guardando...';

    try {
      // Obtener datos del formulario
      const nuevoNombre = document.getElementById("new-name")?.value.trim();
      const nuevoEmail = document.getElementById("email")?.value.trim();
      const nuevaPassword = document.getElementById("password")?.value;
      const imagenFile = profileImageInput?.files[0];
      
      console.log('📝 Datos del formulario:');
      console.log('   Nuevo nombre:', nuevoNombre || '(sin cambios)');
      console.log('   Nuevo email:', nuevoEmail || '(sin cambios)');
      console.log('   Nueva password:', nuevaPassword ? '***' : '(sin cambios)');
      console.log('   Imagen:', imagenFile?.name || '(sin cambios)');
      
      // Validaciones
      if (!nuevoNombre && !nuevoEmail && !nuevaPassword && !imagenFile) {
        alert("⚠️ Debes cambiar al menos un campo");
        return;
      }

      // Verificar si el nuevo nombre ya existe (si cambió)
      if (nuevoNombre && nuevoNombre !== nombreUsuarioActual) {
        console.log('🔍 Verificando si el nombre ya existe...');
        const nombreExiste = await verificarNombreUsuario(nuevoNombre);
        if (nombreExiste) {
          alert("❌ El nombre de usuario ya está en uso");
          return;
        }
        console.log('✅ Nombre disponible');
      }

      // Crear FormData para enviar archivo + datos
      const formData = new FormData();
      
      // Solo incluir campos que se modificaron
      if (nuevoNombre && nuevoNombre !== nombreUsuarioActual) {
        formData.append('nuevoNombreUsuario', nuevoNombre);
      }
      
      if (nuevoEmail) {
        formData.append('correoElectronico', nuevoEmail);
      }
      
      if (nuevaPassword) {
        formData.append('contrasena', nuevaPassword);
      }
      
      if (imagenFile) {
        formData.append('imagenPerfil', imagenFile);
      }
      
      // Indicar que queremos actualizar referencias
      formData.append('actualizarReferencias', 'true');

      // Construir URL completa
      const url = `${API_URL}/usuarios/${nombreUsuarioActual}/actualizar`;
      console.log('📤 Enviando petición a:', url);

      // Hacer la petición
      const response = await fetch(url, {
        method: 'PUT',
        body: formData
        // NO incluir Content-Type, FormData lo maneja
      });

      console.log('📡 Respuesta recibida:');
      console.log('   Status:', response.status);
      console.log('   Status Text:', response.statusText);
      console.log('   Content-Type:', response.headers.get('content-type'));

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Si no es JSON, leer como texto para ver qué devolvió el servidor
        const text = await response.text();
        console.error('❌ Respuesta no es JSON:', text.substring(0, 500));
        throw new Error('El servidor no devolvió JSON. Verifica que el endpoint exista.');
      }

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.detalles || 'Error al actualizar perfil');
      }

      console.log('✅ Perfil actualizado:', result);

      // Actualizar sesión local con los nuevos datos
      const nuevaSesion = {
        nombreUsuario: result.usuario.nombreUsuario,
        correoElectronico: result.usuario.correoElectronico,
        imagenPerfil: result.usuario.imagenPerfil,
        fechaRegistro: result.usuario.fechaRegistro
      };
      
      localStorage.setItem('userSession', JSON.stringify(nuevaSesion));
      console.log('✅ Sesión actualizada');

      // Mostrar mensaje de éxito con detalles
      let mensaje = '✅ Perfil actualizado correctamente\n\n';
      if (result.cambios) {
        mensaje += 'Cambios realizados:\n';
        if (result.cambios.recetas) mensaje += `• ${result.cambios.recetas} recetas actualizadas\n`;
        if (result.cambios.blogs) mensaje += `• ${result.cambios.blogs} blogs actualizados\n`;
        if (result.cambios.valoraciones) mensaje += `• ${result.cambios.valoraciones} valoraciones actualizadas\n`;
        if (result.cambios.comentarios) mensaje += `• ${result.cambios.comentarios} comentarios actualizados\n`;
      }
      
      alert(mensaje);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);

    } catch (error) {
      console.error('❌ ERROR COMPLETO:');
      console.error('   Tipo:', error.name);
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
      
      let mensajeError = error.message;
      
      if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
        mensajeError = 'El servidor no respondió correctamente. Verifica:\n\n' +
                      '1. Que el servidor esté corriendo\n' +
                      '2. Que la URL sea correcta: ' + API_URL + '/usuarios/' + nombreUsuarioActual + '/actualizar\n' +
                      '3. Que el endpoint exista en server.js\n\n' +
                      'Error: ' + error.message;
      }
      
      alert(`❌ Error al actualizar perfil:\n\n${mensajeError}`);
    } finally {
      isSubmitting = false;
      btnGuardar.disabled = false;
      btnGuardar.textContent = textoOriginal;
    }
  });
});

// Función para cargar datos actuales del usuario
async function cargarDatosUsuario(nombreUsuario) {
  try {
    const API_URL = window.API_URL || 'http://localhost:3000/api';
    const API_BASE = window.API_BASE || 'http://localhost:3000';
    
    console.log('📥 Cargando datos del usuario:', nombreUsuario);
    
    const response = await fetch(`${API_URL}/usuarios/${nombreUsuario}`);
    
    if (!response.ok) {
      throw new Error('Usuario no encontrado');
    }
    
    const usuario = await response.json();
    console.log('✅ Datos cargados:', usuario);
    
    // Llenar formulario con datos actuales
    const inputNombre = document.getElementById("new-name");
    const inputEmail = document.getElementById("email");
    
    if (inputNombre) {
      inputNombre.placeholder = `Actual: ${usuario.nombreUsuario}`;
      inputNombre.value = ''; // Dejar vacío, se llena solo si quiere cambiar
    }
    
    if (inputEmail) {
      inputEmail.value = usuario.correoElectronico;
    }
    
    // Cargar imagen de perfil si existe
    if (usuario.imagenPerfil?.almacenadoEn) {
      const profilePreview = document.getElementById("profilePreview");
      if (profilePreview) {
        const imagenURL = usuario.imagenPerfil.almacenadoEn.startsWith('http')
          ? usuario.imagenPerfil.almacenadoEn
          : `${API_BASE}${usuario.imagenPerfil.almacenadoEn}`;
        
        profilePreview.src = imagenURL;
        console.log('🖼️ Imagen de perfil cargada:', imagenURL);
      }
    }
    
  } catch (error) {
    console.error('❌ Error al cargar datos del usuario:', error);
    alert('⚠️ No se pudieron cargar los datos del usuario');
  }
}

// Función para verificar si un nombre de usuario ya existe
async function verificarNombreUsuario(nombreUsuario) {
  try {
    const API_URL = window.API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${API_URL}/usuarios/${nombreUsuario}`);
    return response.ok; // Si devuelve 200, el usuario existe
  } catch (error) {
    console.error('Error al verificar nombre:', error);
    return false;
  }
}

// Función para preview de imagen
function previewProfileImage(event) {
  const file = event.target.files[0];
  
  if (file) {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('⚠️ Por favor selecciona un archivo de imagen válido');
      event.target.value = '';
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('⚠️ La imagen es muy grande. Por favor selecciona una imagen menor a 5MB');
      event.target.value = '';
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const preview = document.getElementById('profilePreview');
      if (preview) {
        preview.src = e.target.result;
      }
      
      const sizeKB = (file.size / 1024).toFixed(2);
      const fileInfo = document.getElementById('fileInfoText');
      if (fileInfo) {
        fileInfo.textContent = `✓ ${file.name} (${sizeKB} KB)`;
        fileInfo.style.color = '#4CAF50';
      }
    };
    
    reader.readAsDataURL(file);
  }
}