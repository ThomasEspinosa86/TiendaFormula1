let usuarioActivoAdmin = null;

try {
  usuarioActivoAdmin = JSON.parse(localStorage.getItem("usuarioActivo"));
} catch (error) {
  usuarioActivoAdmin = null;
}

if (usuarioActivoAdmin === null || usuarioActivoAdmin.rol !== "admin") {
  window.location.replace("../auth/login.html");
}
