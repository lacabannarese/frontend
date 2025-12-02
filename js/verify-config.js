// Script de verificación - NO incluir en producción
// Solo para desarrollo y debugging

(function() {
  console.log('='.repeat(60));
  console.log('VERIFICACIÓN DE CONFIGURACIÓN - RedRecetas');
  console.log('='.repeat(60));
  
  console.log('✓ config.js cargado');
  console.log('✓ API_URL disponible:', window.API_URL);
  console.log('✓ API_BASE disponible:', window.API_BASE);
  console.log('✓ apiRequest function disponible:', typeof window.apiRequest);
  
  console.log('\n📍 Configuración actual:');
  console.log('  - Hostname:', window.location.hostname);
  console.log('  - Modo:', window.location.hostname === 'localhost' ? 'LOCAL' : 'RED');
  console.log('  - API URL:', window.API_URL);
  
  console.log('\n🔍 Probando conectividad...');
  fetch(window.API_BASE + '/')
    .then(r => r.json())
    .then(data => {
      console.log('✅ API respondiendo correctamente');
      console.log('  Respuesta:', data);
    })
    .catch(err => {
      console.error('❌ Error conectando con la API:', err.message);
    });
  
  console.log('='.repeat(60));
})();
