// recuperarPassword.js - Manejo del formulario de recuperación de contraseña

document.addEventListener('DOMContentLoaded', function() {
    // Obtener configuración de API
    const API_URL = 'https://backend-vjgm.onrender.com/api';
  const API_BASE = 'https://backend-vjgm.onrender.com';
    const form = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const submitButton = form.querySelector('input[type="submit"]');

    console.log('🔧 Configuración recuperación de contraseña:');
    console.log('   API_URL:', API_URL);

    // Manejar el envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        // Validar que el email no esté vacío
        if (!email) {
            mostrarMensaje('Por favor ingresa tu correo electrónico', 'error');
            return;
        }

        // Validar formato de email
        if (!validarEmail(email)) {
            mostrarMensaje('Por favor ingresa un correo electrónico válido', 'error');
            return;
        }

        // Deshabilitar el botón mientras se procesa
        submitButton.disabled = true;
        submitButton.value = 'Enviando...';

        try {
            console.log('📧 Enviando solicitud de recuperación para:', email);

            // Realizar la petición al servidor
            const response = await fetch(`${API_URL}/auth/recover-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();
            console.log('📨 Respuesta del servidor:', data);

            if (response.ok) {
                // Éxito
                mostrarMensaje(
                    '✅ ' + (data.info || 'Correo enviado exitosamente. Por favor revisa tu bandeja de entrada.'),
                    'success'
                );
                
                // Limpiar el formulario
                emailInput.value = '';
                
                // Mostrar mensaje adicional
                setTimeout(() => {
                    mostrarMensaje(
                        'Si no ves el correo en tu bandeja de entrada, revisa la carpeta de spam o correo no deseado.',
                        'info'
                    );
                }, 2000);

                // Redirigir al login después de 5 segundos
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 5000);

            } else {
                // Error del servidor
                mostrarMensaje('❌ ' + (data.error || 'Error al enviar el correo de recuperación'), 'error');
            }

        } catch (error) {
            console.error('❌ Error:', error);
            mostrarMensaje('❌ Error de conexión. Por favor intenta nuevamente.', 'error');
        } finally {
            // Rehabilitar el botón
            submitButton.disabled = false;
            submitButton.value = 'Enviar enlace de recuperación';
        }
    });

    // Función para validar formato de email
    function validarEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Función para mostrar mensajes
    function mostrarMensaje(mensaje, tipo) {
        // Eliminar mensajes anteriores
        const mensajesAnteriores = document.querySelectorAll('.mensaje-alerta');
        mensajesAnteriores.forEach(msg => msg.remove());

        // Crear nuevo mensaje
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = `mensaje-alerta mensaje-${tipo}`;
        mensajeDiv.textContent = mensaje;

        // Estilos del mensaje
        mensajeDiv.style.padding = '15px';
        mensajeDiv.style.marginBottom = '15px';
        mensajeDiv.style.borderRadius = '5px';
        mensajeDiv.style.textAlign = 'center';
        mensajeDiv.style.fontSize = '14px';
        mensajeDiv.style.animation = 'fadeIn 0.3s ease-in';

        // Colores según el tipo
        switch(tipo) {
            case 'success':
                mensajeDiv.style.backgroundColor = '#d4edda';
                mensajeDiv.style.color = '#155724';
                mensajeDiv.style.border = '1px solid #c3e6cb';
                break;
            case 'error':
                mensajeDiv.style.backgroundColor = '#f8d7da';
                mensajeDiv.style.color = '#721c24';
                mensajeDiv.style.border = '1px solid #f5c6cb';
                break;
            case 'info':
                mensajeDiv.style.backgroundColor = '#d1ecf1';
                mensajeDiv.style.color = '#0c5460';
                mensajeDiv.style.border = '1px solid #bee5eb';
                break;
            default:
                mensajeDiv.style.backgroundColor = '#fff3cd';
                mensajeDiv.style.color = '#856404';
                mensajeDiv.style.border = '1px solid #ffeeba';
        }

        // Insertar el mensaje antes del formulario
        form.parentNode.insertBefore(mensajeDiv, form);

        // Auto-eliminar después de 8 segundos (excepto mensajes de éxito)
        if (tipo !== 'success') {
            setTimeout(() => {
                mensajeDiv.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => mensajeDiv.remove(), 300);
            }, 8000);
        }
    }

    // Agregar validación en tiempo real del email
    emailInput.addEventListener('blur', function() {
        if (this.value && !validarEmail(this.value)) {
            this.style.borderColor = '#dc3545';
        } else {
            this.style.borderColor = '';
        }
    });

    emailInput.addEventListener('input', function() {
        this.style.borderColor = '';
    });
});

// Animaciones CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }

    .mensaje-alerta {
        animation: fadeIn 0.3s ease-in;
    }

    input[type="submit"]:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    input[type="email"]:focus {
        outline: none;
        border-color: #4CAF50;
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    }
`;
document.head.appendChild(style);