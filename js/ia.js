const API_KEY = "AIzaSyDvAiqrrZ-mgzSuhg0J4mZ1ceNzi0H7pUw";//"AIzaSyCjHyTj9LrrvNJb7Ksu3nb6eYPO4fM9NXE";
const MODEL = "gemini-2.0-flash";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

async function generarReceta(promptUsuario) {
  const prompt = `
Eres un chef experto en recetas saludables. 
Genera una receta sencilla según la solicitud del usuario: "${promptUsuario}".
Devuélvela estrictamente en formato JSON con las siguientes claves:
{
  "titulo": "Nombre de la receta",
  "ingredientes": ["ingrediente1", "ingrediente2", "ingrediente3"],
  "preparacion": ["paso 1", "paso 2", "paso 3"]
}
`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5, responseMimeType: "application/json" }
    }),
  });

  const data = await response.json();
  const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  try {
    const start = texto.indexOf("{");
    const end = texto.lastIndexOf("}") + 1;
    const jsonString = texto.substring(start, end);
    return JSON.parse(jsonString);
  } catch {
    throw new Error("No se pudo procesar la respuesta de la IA");
  }
}

document.getElementById("generateBtn").addEventListener("click", async () => {
  const entrada = document.getElementById("userInput").value.trim();
  const status = document.getElementById("statusMessage");
  const resultDiv = document.getElementById("recipeResult");

  if (!entrada) {
    status.textContent = "Por favor, escribe qué tipo de receta quieres.";
    return;
  }

  status.textContent = "Generando receta...";
  resultDiv.style.display = "none";

  try {
    const receta = await generarReceta(entrada);
    document.getElementById("recipeTitle").textContent = receta.titulo;
    document.getElementById("recipeIngredients").innerHTML = `<strong>Ingredientes:</strong><br> ${receta.ingredientes.join(", ")}`;
    document.getElementById("recipeSteps").innerHTML = `<strong>Preparación:</strong><br> ${receta.preparacion.join("<br>")}`;
    
    resultDiv.style.display = "block";
    status.textContent = "¡Receta generada con éxito!";
  } catch (error) {
    console.error(error);
    status.textContent = "Error al generar la receta. Inténtalo de nuevo.";
  }
});
