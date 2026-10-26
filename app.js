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