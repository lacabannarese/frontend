// Script para el menú hamburguesa
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');
    const body = document.body;
    
    if (menuToggle && navMenu) {
        // Toggle del menú
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
        
        // Cerrar menú al hacer click en un enlace
        const menuLinks = navMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                body.classList.remove('menu-open');
            });
        });
        
        // Cerrar menú al hacer click en el overlay (fuera del menú)
        body.addEventListener('click', function(e) {
            if (body.classList.contains('menu-open') && 
                !menuToggle.contains(e.target) && 
                !navMenu.contains(e.target)) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
        
        // Cerrar menú cuando cambia el tamaño de la ventana (a desktop)
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768) {
                    menuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    body.classList.remove('menu-open');
                }
            }, 250);
        });
        
        // Prevenir que los clics en el menú lo cierren
        navMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});