// Raíz del proyecto, calculada desde este archivo (src/js/navbar.js).
// Así el navbar carga igual desde index.html, pages/ o pages/shop/, en Live Server y en GitHub Pages.
const raizProyecto = new URL("../../", document.currentScript.src);

document.addEventListener("DOMContentLoaded",() => {
    const navbarContainer = document.getElementById("navbar-container");

    if(navbarContainer) {
        fetch(new URL("src/components/navbar.html", raizProyecto))
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el menú.");
            }
            return response.text();
        })
        .then(htmlContent =>{
            // Las rutas de navbar.html están escritas desde la raíz del proyecto
            const plantilla = document.createElement("template");
            plantilla.innerHTML = htmlContent;
            plantilla.content.querySelectorAll("[href], [src]").forEach(elemento => {
                const atributo = elemento.hasAttribute("href") ? "href" : "src";
                const ruta = elemento.getAttribute(atributo);
                if (!/^(#|https?:|data:|mailto:)/.test(ruta)) {
                    elemento.setAttribute(atributo, new URL(ruta, raizProyecto).href);
                }
            });
            navbarContainer.replaceChildren(plantilla.content);
        })
        .catch(error =>
            console.error("Error al cargar el navbar:", error));
    }
});
