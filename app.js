const nombreValor = document.getElementById('nombre').value.trim();
const correoValor = document.getElementById('correo').value.trim();
const telefonoValor = document.getElementById('telefono').value.trim();
const mensajeValor = document.getElementById('mensaje').value.trim();

const formulario = document.getElementById('form-contacto')
formulario.addEventListener('submit', function(evento){
    evento.preventDefault();
})

let esValido = true;

