document.addEventListener("DOMContentLoaded", () => {
  const rawSession = localStorage.getItem('userSession');
  const session = rawSession ? JSON.parse(rawSession) : {};
  const nombreUsuario = session.nombreUsuario || "Invitado";

  if (nombreUsuario === "Invitado") {
    document.getElementById("TusRecetas").setAttribute("href", "login.html");
    document.getElementById("RecetasPublicadas").setAttribute("href", "login.html");
    document.getElementById("CrearReceta").setAttribute("href", "login.html");
    document.getElementById("CrearConsejo").setAttribute("href", "login.html");
  }
});
