let contador = 0;

document.getElementById("Admin").addEventListener("click", function() {

    const rawSession = localStorage.getItem('userSession');
    const session = rawSession ? JSON.parse(rawSession) : {};
    const tipo = session.tipo || "usuario";


    contador++; // sumamos un clic
    console.log("Clic número: " + contador);

    if (tipo === "admin"){
        if (contador === 5) {
            // cuando llegue a 5, redireccionamos
            window.location.href = "Panel_admin.html";
        }
    }else {
        window.location.href = "index.html";
    }
});

document.getElementById("regresaraindex").addEventListener("click", function() {
    window.location.href = "index.html";
});
