document.addEventListener("DOMContentLoaded",() => {
    const navbarContainer = document.getElementById("navbar-container");

    if(navbarContainer) {
        fetch("/TiendaFormula1/componentes/navbar.html")
        .then(response => response.text())
        .then(htmlContent =>{
            navbarContainer.innerHTML = htmlContent;
        })
        .catch(error => 
            console.error("Error al cargar el navbar:", error));
    }
});