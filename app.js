const nombreValor = document.getElementById('nombre').value.trim();
const correoValor = document.getElementById('correo').value.trim();
const telefonoValor = document.getElementById('telefono').value.trim();
const mensajeValor = document.getElementById('mensaje').value.trim();

const formulario = document.getElementById('form-contacto')
formulario.addEventListener('submit', function(evento){
    evento.preventDefault();
})

let esValido = true;

const form = document.getElementById('formContacto');

form.addEventListener('submit', function (event) {
  if (!form.checkValidity()) {
    event.preventDefault();
    event.stopPropagation();
  }
  form.classList.add('was-validated');
});

