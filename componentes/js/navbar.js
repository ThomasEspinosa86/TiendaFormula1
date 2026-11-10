document.addEventListener("DOMContentLoaded",() => {
    const navbarContainer = document.getElementById("navbar-container");

    if(navbarContainer) {
        fetch("componentes/navbar.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el menú.");
            }
            return response.text();
        })
        .then(htmlContent =>{
            navbarContainer.innerHTML = htmlContent;
        })
        .catch(error => 
            console.error("Error al cargar el navbar:", error));
    }
});