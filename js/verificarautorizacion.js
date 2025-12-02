document.addEventListener("DOMContentLoaded", () => {
    const rawSession = localStorage.getItem('userSession');
    const session = rawSession ? JSON.parse(rawSession) : {};
    const tipo = session.tipo || "usuario";

    if (tipo === "usuario") {
        window.location.href = "index.html";
    }
});
