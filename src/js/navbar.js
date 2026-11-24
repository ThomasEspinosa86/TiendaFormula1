// Raíz del proyecto, calculada desde este archivo (src/js/navbar.js).
// Así el navbar carga igual desde index.html, pages/ o pages/shop/, en Live Server y en GitHub Pages.
const raizProyecto = new URL("../../", document.currentScript.src);

function actualizarUsuarioNavbar() {
    let usuario = null;
    try {
        usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
    } catch (error) {
        usuario = null;
    }

    document.querySelectorAll(".navbar-links").forEach(function (lista) {
        lista.querySelectorAll("li").forEach(function (item) {
            const enlace = item.querySelector("a");
            if (!enlace) return;

            const esUsuario = enlace.querySelector('img[alt="Usuario"]') ||
                enlace.getAttribute("href") === "#" ||
                (enlace.getAttribute("href") || "").includes("auth/login.html");
            if (!esUsuario) return;

            if (usuario && usuario.nombre) {
                item.className = "usuario-menu";
                item.innerHTML =
                    '<button type="button" class="usuario-menu-boton" aria-expanded="false" aria-haspopup="menu">' +
                    '<img src="https://cdn-icons-png.flaticon.com/512/1077/1077063.png" alt="" class="nav-icon usuario-icono">' +
                    '<span class="nombre-usuario-navbar"></span>' +
                    '<span class="usuario-flecha" aria-hidden="true">&#9662;</span>' +
                    '</button>' +
                    '<div class="usuario-menu-desplegable" role="menu">' +
                    '<button type="button" class="cerrar-sesion-boton" role="menuitem">Cerrar sesión</button>' +
                    '</div>';

                item.querySelector(".nombre-usuario-navbar").textContent = usuario.nombre;
                const boton = item.querySelector(".usuario-menu-boton");
                const menu = item.querySelector(".usuario-menu-desplegable");

                boton.addEventListener("click", function (evento) {
                    evento.stopPropagation();
                    const abierto = menu.classList.toggle("abierto");
                    boton.setAttribute("aria-expanded", String(abierto));
                });
                item.querySelector(".cerrar-sesion-boton").addEventListener("click", function () {
                    localStorage.removeItem("usuarioActivo");
                    window.location.reload();
                });
            } else if (!item.classList.contains("usuario-menu")) {
                enlace.className = "usuario-login";
                const loginUrl = new URL("pages/auth/login.html", raizProyecto).href;
                enlace.href = loginUrl;
            }
        });
    });
}

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
            actualizarUsuarioNavbar();
        })
        .catch(error =>
            console.error("Error al cargar el navbar:", error));
    }
});

window.addEventListener("storage", function (evento) {
    if (evento.key === "usuarioActivo") {
        actualizarUsuarioNavbar();
    }
});

document.addEventListener("click", function (evento) {
    document.querySelectorAll(".usuario-menu").forEach(function (item) {
        if (!item.contains(evento.target)) {
            item.querySelector(".usuario-menu-desplegable")?.classList.remove("abierto");
            item.querySelector(".usuario-menu-boton")?.setAttribute("aria-expanded", "false");
        }
    });
});
