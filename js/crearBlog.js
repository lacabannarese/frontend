document.addEventListener("DOMContentLoaded", publicarBlogConImagen);

async function publicarBlogConImagen() {
  // ✅ Usar la configuración global (cargada desde config.js)
  const API_URL = 'https://backend-vjgm.onrender.com/api';
  
  
  const btn = document.getElementById("publicar_consejo");

  const rawSession = localStorage.getItem('userSession');
  const session = rawSession ? JSON.parse(rawSession) : {};
  const nombreUsuario = session.nombreUsuario || "Invitado";

  btn.addEventListener("click", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("tituloc")?.value.trim();
    const contenido = document.getElementById("contenidoc")?.value.trim();
    const imagenInput = document.getElementById("subirimagen");
    const imagenFile = imagenInput?.files[0];

    if (!titulo || !contenido) {
      alert("⚠️ Por favor completa el título y el contenido");
      return;
    }

    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.6';
    btn.textContent = 'Subiendo...';

    try {
      // Crear FormData para enviar archivo
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('contenido', contenido);
      formData.append('autor', nombreUsuario);
      
      if (imagenFile) {
        formData.append('imagen', imagenFile);
      }

      console.log('📤 Enviando blog a:', `${API_URL}/blogs`);

      const response = await fetch(`${API_URL}/blogs`, {
        method: "POST",
        body: formData // NO incluir Content-Type, el navegador lo configura automáticamente
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Blog creado con imagen:', result);

      alert("✅ Blog publicado con éxito");
      
      document.getElementById("tituloc").value = '';
      document.getElementById("contenidoc").value = '';
      if (imagenInput) imagenInput.value = '';

      setTimeout(() => {
        window.location.href = 'Blogconsejos.html';
      }, 1000);

    } catch (error) {
      console.error("❌ Error al crear blog:", error);
      alert("❌ Error al publicar: " + error.message);
      
      btn.style.pointerEvents = 'auto';
      btn.style.opacity = '1';
      btn.textContent = 'Publicar';
    }
  });
}