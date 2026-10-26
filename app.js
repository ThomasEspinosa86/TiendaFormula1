const formulario = document.getElementById('formContacto');

formulario.addEventListener('submit', function(evento) {

evento.preventDefault();

const nombreValor = document.getElementById('nombre').value.trim();
const correoValor = document.getElementById('correo').value.trim();
const telefonoValor = document.getElementById('telefono').value.trim();
const mensajeValor = document.getElementById('mensaje').value.trim();

let esValido = true;
if (nombreValor === "" || nombreValor.length < 3) {
    esValido = false; 
}

const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!patronCorreo.test(correoValor)) {
    esValido = false;
}

const patronTelefono = /^\d{7,10}$/; 
if (!patronTelefono.test(telefonoValor)) {
    esValido = false;
}

if (mensajeValor.length < 10) {
    esValido = false;
}

formulario.classList.add('was-validated');

if (esValido) {
    formulario.submit(); 
}
}); 

// Manejo del Formulario de Contacto (Formspree)
const form = document.getElementById("form-contacto");
const respuesta = document.getElementById("respuesta-form");

function mostrarRespuestaFormulario(tipo, texto) {
  if (respuesta) {
    respuesta.className = "alert alert-" + tipo + " d-block mt-3 mb-0";
    respuesta.textContent = texto;
  }
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      if (res.ok) {
        mostrarRespuestaFormulario("success", "¡Mensaje enviado! Te responderemos pronto.");
        form.reset();
      } else {
        mostrarRespuestaFormulario("danger", "No se pudo enviar. Intenta de nuevo.");
      }
    } catch (err) {
      mostrarRespuestaFormulario("danger", "Error de conexión. Intenta de nuevo.");
    }
  });
}