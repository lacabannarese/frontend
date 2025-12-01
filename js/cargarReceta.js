document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = 'https://backend-vjgm.onrender.com/api';
  const API_BASE = 'https://backend-vjgm.onrender.com';

  console.log('🔧 Configuración Recetas:');
  console.log('   API_URL:', API_URL);
  console.log('   API_BASE:', API_BASE);

  const grid = document.getElementById("publicadas-grid");

  const rawSession = localStorage.getItem('userSession');
  const session = rawSession ? JSON.parse(rawSession) : {};
  const nombreUsuario = session.nombreUsuario || "Invitado";
  
  const filtros = {};
  if (grid?.dataset.tipo) filtros.tipo = grid.dataset.tipo;
  if (grid?.dataset.usuario) filtros.usuario = nombreUsuario;
  if (grid?.dataset.titulo) filtros.titulo = grid.dataset.titulo;
  if (grid?.dataset.ingrediente) filtros.ingrediente = grid.dataset.ingrediente;

  await cargarRecetasPublicadas(filtros);
});

async function cargarRecetasPublicadas(filtros = {}) {
  const API_URL = window.API_URL || 'http://localhost:3000/api';
  const API_BASE = window.API_BASE || 'http://localhost:3000';
  const grid = document.getElementById("publicadas-grid");

  if (!grid) {
    console.error('❌ Contenedor de recetas no encontrado');
    return;
  }

  grid.innerHTML = "<p style='text-align: center; padding: 2rem;'>⏳ Cargando recetas...</p>";

  try {
    const params = new URLSearchParams(filtros).toString();
    const url = `${API_URL}/recetas${params ? `?${params}` : ''}`;
    console.log('📖 Cargando recetas desde:', url);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const recetas = await response.json();
    console.log(`✅ ${recetas.length} recetas cargadas:`, recetas);

    if (!Array.isArray(recetas) || recetas.length === 0) {
      grid.innerHTML = `
        <div style="text-align: center; padding: 3rem; grid-column: 1/-1;">
          <p style="font-size: 1.2rem; color: #666;">🍽️ No hay recetas publicadas con estos filtros.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = recetas.map(receta => {
      let imagenURL = 'img/carne.jpg';
      if (receta.imagen?.almacenadoEn) {
        imagenURL = receta.imagen.almacenadoEn.startsWith('http')
          ? receta.imagen.almacenadoEn
          : `${API_BASE}${receta.imagen.almacenadoEn}`;
      }

      return `
        <article class="menu-item">
          <div class="item-image-container">
            <img src="${imagenURL}" alt="${escapeHtml(receta.titulo)}" class="item-image">
          </div>
          <div class="item-details-block">
            <div class="item-text">
              <h2>${escapeHtml(receta.titulo)}</h2>
              <p>${escapeHtml(truncate(receta.descripcion || '', 140))}</p>
            </div>
            <div class="item-bottom">
              <div class="rating-stars">${renderStars(receta.rating)}</div>
              <img src="img/guardar.png" alt="Guardar" class="bookmark-icon" title="Agregar a favoritos">
            </div>
          </div>
        </article>
      `;
    }).join("");

    console.log('✅ Recetas renderizadas correctamente');
    
    // Inicializar sistema de favoritos después de renderizar
    if (window.favoritosSystem) {
      window.favoritosSystem.setupBookmarks();
    }

  } catch (err) {
    console.error('❌ Error cargando recetas:', err);
    grid.innerHTML = `<p>Error al cargar recetas: ${err.message}</p>`;
  }
}

// Helpers
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;", 
    "<": "&lt;", 
    ">": "&gt;", 
    '"': "&quot;", 
    "'": "&#39;"
  }[s]));
}

function truncate(text, n) {
  if (!text) return "";
  return text.length > n ? text.slice(0, n - 1) + "…" : text;
}

function renderStars(rating) {
  const r = Math.round(rating || 0);
  const filled = "★".repeat(r);
  const empty = "☆".repeat(5 - r);
  return filled + empty;
}

if (typeof window !== 'undefined') {
  window.cargarRecetasPublicadas = cargarRecetasPublicadas;
}