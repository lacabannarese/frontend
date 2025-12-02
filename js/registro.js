document.addEventListener("DOMContentLoaded", () => {
    // ✅ Usar la configuración global (cargada desde config.js)
   const API_URL = 'https://backend-vjgm.onrender.com/api';
  const API_BASE = 'https://backend-vjgm.onrender.com';
    
    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Obtener campos
        const correo = document.getElementById("email").value.trim();
        const usuario = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const confirmar = document.getElementById("confirm-password").value;
        const tipo = "usuario";

        // Validar contraseñas
        if (password !== confirmar) {
            alert("⚠️ Las contraseñas no coinciden.");
            return;
        }

        // Crear objeto EXACTO como tu backend lo espera
        const nuevoUsuario = {
            nombreUsuario: usuario,
            correoElectronico: correo,
            contrasena: password,
            tipo: tipo
        };

        try {
            console.log('📝 Registrando usuario en:', `${API_URL}/usuarios`);
            
            // Llamada a la API
            const respuesta = await fetch(`${API_URL}/usuarios`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(nuevoUsuario)
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                console.log('✅ Usuario registrado:', data);
                alert("🎉 Usuario registrado exitosamente");
                window.location.href = "login.html";
            } else {
                console.error('❌ Error en registro:', data);
                alert("❌ Error: " + (data.message || "Correo o Usuario ya registrado"));
            }

        } catch (error) {
            console.error("❌ Error de red:", error);
            alert("❌ No se pudo conectar al servidor.");
        }

    });

});