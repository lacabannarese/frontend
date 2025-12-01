// Sistema de creación de recetas
document.addEventListener('DOMContentLoaded', function() {
    const recipeForm = document.getElementById('recipeForm');
    const imageInput = document.getElementById('recipe-image');
    const imagePreview = document.getElementById('image-preview');
    const fileInputLabel = document.querySelector('.file-input-text');
    
    // Manejar la vista previa de imagen
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (file) {
                // Actualizar el texto del label
                fileInputLabel.textContent = file.name;
                
                // Crear vista previa
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    imagePreview.innerHTML = `
                        <div class="preview-container">
                            <img src="${e.target.result}" alt="Vista previa">
                            <button type="button" class="remove-image" onclick="removeImage()">
                                ✕ Eliminar
                            </button>
                        </div>
                    `;
                    imagePreview.style.display = 'block';
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Manejar el envío del formulario
    if (recipeForm) {
        recipeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener los valores del formulario
            const mealType = document.getElementById('meal-type').value;
            const dishName = document.getElementById('dish-name').value;
            const ingredients = document.getElementById('ingredients').value;
            const description = document.getElementById('description').value;
            const imageFile = imageInput.files[0];
            
            // Validar campos requeridos
            if (!mealType || !dishName || !ingredients || !description) {
                alert('Por favor completa todos los campos requeridos');
                return;
            }
            
            // Crear objeto de receta
            const recipe = {
                id: Date.now(),
                mealType: mealType,
                dishName: dishName,
                ingredients: ingredients,
                description: description,
                createdAt: new Date().toISOString(),
                author: getCurrentUserName()
            };
            
            // Si hay imagen, convertirla a base64
            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    recipe.image = e.target.result;
                    saveRecipe(recipe);
                };
                reader.readAsDataURL(imageFile);
            } else {
                saveRecipe(recipe);
            }
        });
    }
});

/**
 * Guarda la receta en localStorage
 */
function saveRecipe(recipe) {
    try {
        // Obtener recetas existentes
        let recipes = JSON.parse(localStorage.getItem('userRecipes')) || [];
        
        // Agregar nueva receta
        recipes.push(recipe);
        
        // Guardar en localStorage
        localStorage.setItem('userRecipes', JSON.stringify(recipes));
        
        // Mostrar mensaje de éxito
        showSuccessMessage();
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
            window.location.href = 'tusrecetas.html';
        }, 2000);
        
    } catch (e) {
        console.error('Error al guardar la receta:', e);
        alert('Hubo un error al guardar tu receta. Por favor intenta de nuevo.');
    }
}

/**
 * Muestra un mensaje de éxito
 */
function showSuccessMessage() {
    // Crear elemento de mensaje
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <div class="success-content">
            <span class="success-icon">✓</span>
            <h3>¡Receta publicada con éxito!</h3>
            <p>Redirigiendo a tus recetas...</p>
        </div>
    `;
    
    // Agregar al body
    document.body.appendChild(message);
    
    // Mostrar con animación
    setTimeout(() => {
        message.classList.add('show');
    }, 100);
}

/**
 * Elimina la imagen seleccionada
 */
function removeImage() {
    const imageInput = document.getElementById('recipe-image');
    const imagePreview = document.getElementById('image-preview');
    const fileInputLabel = document.querySelector('.file-input-text');
    
    // Limpiar input
    imageInput.value = '';
    
    // Limpiar preview
    imagePreview.innerHTML = '';
    imagePreview.style.display = 'none';
    
    // Restaurar texto del label
    fileInputLabel.textContent = 'Seleccionar imagen';
}

/**
 * Obtiene el nombre del usuario actual
 */
function getCurrentUserName() {
    if (window.authSession) {
        const user = window.authSession.getCurrentUser();
        return user ? user.username : 'Usuario Anónimo';
    }
    return 'Usuario Anónimo';
}

/**
 * Validación en tiempo real
 */
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('error');
            }
        });
    });
});