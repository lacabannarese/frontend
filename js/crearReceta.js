document.addEventListener("DOMContentLoaded", publicarRecetaConImagen);

async function publicarRecetaConImagen() {
  
  const API_URL = 'https://backend-vjgm.onrender.com/api';
  
  
  
  const btn = document.getElementById("publicar_receta");
  const form = document.getElementById("recipeForm");

  const rawSession = localStorage.getItem('userSession');
  const session = rawSession ? JSON.parse(rawSession) : {};
  const nombreUsuario = session.nombreUsuario || "Invitado";
  
  console.log('👤 Usuario:', nombreUsuario);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tipo = document.getElementById("meal-type")?.value.trim();
    const titulo = document.getElementById("dish-name")?.value.trim();
    const ingredientes = document.getElementById("ingredients")?.value.trim();
    const descripcion = document.getElementById("description")?.value.trim();
    const imagenInput = document.getElementById("recipe-image");
    const imagenFile = imagenInput?.files[0];

    // Validación de campos obligatorios
    if (!tipo || !titulo || !ingredientes || !descripcion) {
      alert("⚠️ Por favor completa todos los campos obligatorios");
      return;
    }

    // Validar tamaño de imagen si se seleccionó una
    if (imagenFile) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (imagenFile.size > maxSize) {
        alert("⚠️ La imagen es demasiado grande. Máximo 5MB");
        return;
      }
    }

    // Deshabilitar botón durante la carga
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.6';
    btn.innerHTML = '📤 Subiendo...';

    try {
      // Crear FormData para enviar archivo y datos
      const formData = new FormData();
      formData.append('tipo', tipo);
      formData.append('titulo', titulo);
      formData.append('ingredientes', ingredientes);
      formData.append('descripcion', descripcion);
      formData.append('usuario', nombreUsuario);
      
      if (imagenFile) {
        formData.append('imagen', imagenFile);
        console.log('📸 Imagen seleccionada:', imagenFile.name, '- Tamaño:', (imagenFile.size / 1024).toFixed(2), 'KB');
      }

      const response = await fetch(`${API_URL}/recetas`, {
        method: "POST",
        body: formData // NO incluir Content-Type, el navegador lo configura automáticamente con boundary
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Receta creada con imagen:', result);

      alert("✅ ¡Receta publicada con éxito!");
      
      // Limpiar formulario
      form.reset();
      const preview = document.getElementById('image-preview');
      if (preview) preview.innerHTML = '';

      // Redireccionar después de 1 segundo
      setTimeout(() => {
        window.location.href = 'Recetas.html';
      }, 1000);

    } catch (error) {
      console.error("❌ Error al crear receta:", error);
      alert("❌ Error al publicar la receta: " + error.message);
      
      // Rehabilitar botón
      btn.style.pointerEvents = 'auto';
      btn.style.opacity = '1';
      btn.innerHTML = '✨ Publicar Receta';
    }
  });

  // Preview de imagen antes de subir
  const imagenInput = document.getElementById("recipe-image");
  const preview = document.getElementById('image-preview');
  
  if (imagenInput && preview) {
    imagenInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      
      if (file) {
        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
          alert('⚠️ Por favor selecciona un archivo de imagen válido');
          imagenInput.value = '';
          preview.innerHTML = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          preview.innerHTML = `
            <div style="position: relative; display: inline-block;">
              <img src="${e.target.result}" alt="Preview" style="max-width: 300px; max-height: 200px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <button type="button" onclick="document.getElementById('recipe-image').value=''; document.getElementById('image-preview').innerHTML='';" 
                      style="position: absolute; top: 5px; right: 5px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 16px; line-height: 1;">
                ×
              </button>
              <p style="margin-top: 8px; font-size: 0.9rem; color: #666;">
                📁 ${file.name} - ${(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          `;
        };
        reader.readAsDataURL(file);
      } else {
        preview.innerHTML = '';
      }
    });
  }
}