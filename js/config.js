// Configuración de la API para RedRecetas - VERSIÓN PRODUCCIÓN
// ============================================================

const API_URL = 'https://backend-vjgm.onrender.com/api';
const API_BASE = 'https://backend-vjgm.onrender.com';

const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

const API_CONFIG = {
  // URLs locales (para desarrollo)
  LOCAL: 'http://localhost:3000/api',
  LOCAL_BASE: 'http://localhost:3000',
  
  // URLs de producción (Render)
  PRODUCTION: API_URL,
  PRODUCTION_BASE: API_BASE,
  
  get BASE_URL() {
    // Si estamos en localhost, usar API local
    if (isLocalhost) {
      return this.LOCAL;
    }
    // Si estamos en producción (Hostinger), usar Render
    else {
      return this.PRODUCTION;
    }
  },
  
  get BASE() {
    if (isLocalhost) {
      return this.LOCAL_BASE;
    } else {
      return this.PRODUCTION_BASE;
    }
  }
};

// Exportar la configuración para uso global
window.API_URL = API_CONFIG.BASE_URL;
window.API_BASE = API_CONFIG.BASE;

// Función helper para hacer peticiones a la API
window.apiRequest = async function(endpoint, options = {}) {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${window.API_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Verificar conectividad con la API al cargar
async function checkAPIConnection() {
  try {
    const testUrl = window.API_BASE;
    console.log('🔍 Probando conexión con:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexión con API establecida:', data);
      return true;
    } else {
      console.error('❌ Error de conexión:', response.status);
      return false;
    }
  } catch (error) {
    console.error('⚠️ No se pudo conectar con la API:', error.message);
    console.log('🔄 Verifica que tu backend en Render esté activo');
    return false;
  }
}

// Ejecutar verificación al cargar la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAPIConnection);
} else {
  checkAPIConnection();
}
