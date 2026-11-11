// carrito.js
// Vista del carrito, agregar, eliminar y guardado en localStorage
// La lógica de sumar y restar cantidades está en cantidad.js 

const CLAVE_CARRITO = 'carritoZonaDRS';
const MAX_CANTIDAD = 10;

// ---------- localStorage ----------

function obtenerCarrito() {
  const guardado = localStorage.getItem(CLAVE_CARRITO);
  if (!guardado) {
    return [];
  }
  try {
    return JSON.parse(guardado);
  } catch (error) {
    // si el dato se dañó empezamos con el carrito vacío
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

// ---------- funciones de ayuda ----------

function formatearPrecio(valor) {
  return '$' + valor.toLocaleString('es-CO');
}

function crearId(nombre) {
  return nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function escaparTexto(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function calcularTotal(carrito) {
  let total = 0;
  carrito.forEach(function (producto) {
    total += producto.precio * producto.cantidad;
  });
  return total;
}

function contarUnidades(carrito) {
  let unidades = 0;
  carrito.forEach(function (producto) {
    unidades += producto.cantidad;
  });
  return unidades;
}

// ---------- alertas de Bootstrap ----------

function mostrarAlerta(tipo, mensaje) {
  let zona = document.getElementById('zona-alertas');
  if (!zona) {
    zona = document.createElement('div');
    zona.id = 'zona-alertas';
    document.body.appendChild(zona);
  }

  const alerta = document.createElement('div');
  alerta.className = 'alert alert-' + tipo + ' alert-dismissible fade show shadow-sm';
  alerta.setAttribute('role', 'alert');
  alerta.innerHTML = escaparTexto(mensaje) +
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>';
  zona.appendChild(alerta);

  // se quita sola a los 3 segundos
  setTimeout(function () {
    alerta.classList.remove('show');
    setTimeout(function () {
      alerta.remove();
    }, 200);
  }, 3000);
}

// ---------- agregar y eliminar ----------

function agregarAlCarrito(producto) {
  const carrito = obtenerCarrito();
  const existente = carrito.find(function (item) {
    return item.id === producto.id;
  });

  if (existente) {
    if (existente.cantidad >= MAX_CANTIDAD) {
      mostrarAlerta('warning', 'Solo puedes llevar ' + MAX_CANTIDAD + ' unidades de este producto.');
      return;
    }
    existente.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: 1
    });
  }

  guardarCarrito(carrito);
  actualizarVista();
  mostrarAlerta('success', 'Agregaste "' + producto.nombre + '" al carrito.');
}

function eliminarDelCarrito(id) {
  let carrito = obtenerCarrito();
  const producto = carrito.find(function (item) {
    return item.id === id;
  });

  carrito = carrito.filter(function (item) {
    return item.id !== id;
  });

  guardarCarrito(carrito);
  actualizarVista();
  if (producto) {
    mostrarAlerta('info', 'Quitaste "' + producto.nombre + '" del carrito.');
  }
}

function vaciarCarrito() {
  guardarCarrito([]);
  actualizarVista();
  mostrarAlerta('info', 'Vaciaste el carrito.');
}

// Lee los datos de una tarjeta de producto.
// Sirve para las tarjetas del catálogo (data-...) y también para las del index (.product-card / .new-card)
function leerProducto(tarjeta) {
  const elementoNombre = tarjeta.querySelector('.product-name, .new-name, .nombre-producto');
  const elementoPrecio = tarjeta.querySelector('.product-price, .new-price, .precio-producto');
  const imagen = tarjeta.querySelector('img');

  const nombre = (tarjeta.dataset.nombre || elementoNombre.textContent).trim();
  const textoPrecio = tarjeta.dataset.precio || elementoPrecio.textContent;
  const precio = parseInt(String(textoPrecio).replace(/\D/g, ''), 10);

  return {
    id: tarjeta.dataset.id || crearId(nombre),
    nombre: nombre,
    precio: precio,
    imagen: imagen ? imagen.src : ''
  };
}

// ---------- dibujar la vista ----------

function dibujarMiniCarrito() {
  const lista = document.getElementById('mini-lista');
  const total = document.getElementById('mini-total');
  const contador = document.getElementById('contador-carrito');
  if (!lista) {
    return;
  }

  const carrito = obtenerCarrito();

  if (contador) {
    contador.textContent = contarUnidades(carrito);
  }
  if (total) {
    total.textContent = formatearPrecio(calcularTotal(carrito));
  }

  if (carrito.length === 0) {
    lista.innerHTML = '<p class="mini-vacio mb-0">Todavía no has agregado productos.</p>';
    return;
  }

  let html = '';
  carrito.forEach(function (producto) {
    html += '<div class="mini-item">' +
      '<img src="' + producto.imagen + '" alt="' + escaparTexto(producto.nombre) + '">' +
      '<div class="flex-grow-1">' +
        '<p class="mini-nombre">' + escaparTexto(producto.nombre) + '</p>' +
        '<small>' + producto.cantidad + ' x ' + formatearPrecio(producto.precio) + '</small>' +
      '</div>' +
      '<button type="button" class="btn-quitar" data-accion="eliminar" data-id="' + producto.id + '" aria-label="Eliminar producto">&times;</button>' +
    '</div>';
  });
  lista.innerHTML = html;
}

function dibujarCarrito() {
  const lista = document.getElementById('lista-carrito');
  if (!lista) {
    return; // esta página no es la del carrito
  }

  const carrito = obtenerCarrito();
  const vacio = document.getElementById('carrito-vacio');
  const contenido = document.getElementById('carrito-contenido');

  if (carrito.length === 0) {
    vacio.classList.remove('d-none');
    contenido.classList.add('d-none');
    return;
  }

  vacio.classList.add('d-none');
  contenido.classList.remove('d-none');

  let html = '';
  carrito.forEach(function (producto) {
    const subtotal = producto.precio * producto.cantidad;
    html += '<article class="item-carrito card mb-3">' +
      '<div class="card-body">' +
        '<div class="row align-items-center g-3">' +
          '<div class="col-4 col-md-2">' +
            '<img class="img-item" src="' + producto.imagen + '" alt="' + escaparTexto(producto.nombre) + '">' +
          '</div>' +
          '<div class="col-8 col-md-4">' +
            '<h2 class="nombre-item">' + escaparTexto(producto.nombre) + '</h2>' +
            '<p class="precio-unitario mb-0">' + formatearPrecio(producto.precio) + ' c/u</p>' +
          '</div>' +
          '<div class="col-7 col-md-3">' +
            '<div class="input-group input-group-sm controles-cantidad">' +
              '<button type="button" class="btn btn-outline-dark" data-accion="menos" data-id="' + producto.id + '" aria-label="Disminuir cantidad">&minus;</button>' +
              '<input type="number" class="form-control text-center input-cantidad" value="' + producto.cantidad + '" min="1" max="' + MAX_CANTIDAD + '" data-id="' + producto.id + '" aria-label="Cantidad">' +
              '<button type="button" class="btn btn-outline-dark" data-accion="mas" data-id="' + producto.id + '" aria-label="Aumentar cantidad">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="col-5 col-md-3 text-end">' +
            '<p class="subtotal-item mb-1">' + formatearPrecio(subtotal) + '</p>' +
            '<button type="button" class="btn btn-sm btn-eliminar" data-accion="eliminar" data-id="' + producto.id + '">Eliminar</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</article>';
  });
  lista.innerHTML = html;

  document.getElementById('resumen-unidades').textContent = contarUnidades(carrito);
  document.getElementById('resumen-total').textContent = formatearPrecio(calcularTotal(carrito));
}

function actualizarVista() {
  dibujarMiniCarrito();
  dibujarCarrito();
}

// ---------- eventos ----------

document.addEventListener('click', function (evento) {
  // botones de agregar (catálogo y tarjetas del index)
  const botonAgregar = evento.target.closest('.btn-agregar, .product-card .btn-f1, .new-card .btn-f1-dark');
  if (botonAgregar) {
    const tarjeta = botonAgregar.closest('.tarjeta-producto, .product-card, .new-card');
    if (tarjeta) {
      agregarAlCarrito(leerProducto(tarjeta));
    }
    return;
  }

  // botones del carrito (más, menos, eliminar)
  const boton = evento.target.closest('[data-accion]');
  if (!boton) {
    return;
  }
  const id = boton.dataset.id;

  if (boton.dataset.accion === 'eliminar') {
    eliminarDelCarrito(id);
  } else if (boton.dataset.accion === 'mas') {
    aumentarCantidad(id);      // viene de cantidad.js
  } else if (boton.dataset.accion === 'menos') {
    disminuirCantidad(id);     // viene de cantidad.js
  }
});

document.addEventListener('change', function (evento) {
  if (evento.target.classList.contains('input-cantidad')) {
    actualizarCantidadManual(evento.target.dataset.id, evento.target.value); // viene de cantidad.js
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const botonVaciar = document.getElementById('btn-vaciar');
  const botonFinalizar = document.getElementById('btn-finalizar');

  if (botonVaciar) {
    botonVaciar.addEventListener('click', vaciarCarrito);
  }

  if (botonFinalizar) {
    botonFinalizar.addEventListener('click', function () {
      guardarCarrito([]);
      actualizarVista();
      mostrarAlerta('success', '¡Gracias por tu compra! Tu pedido quedó registrado.');
    });
  }

  actualizarVista();
});

// si abren el carrito en otra pestaña, se mantiene sincronizado
window.addEventListener('storage', actualizarVista);
