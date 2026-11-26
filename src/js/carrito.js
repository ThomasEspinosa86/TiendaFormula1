// carrito.js
// Vista del carrito, agregar, eliminar y guardado en localStorage
// La lógica de sumar y restar cantidades está en cantidad.js 
const CLAVE_CARRITO = 'carritoZonaDRS';
const MAX_CANTIDAD = 10;
const URL_LOGIN = new URL('../../pages/auth/login.html', document.currentScript.src).href;

function obtenerUsuarioActivo() {
  try {
    return JSON.parse(localStorage.getItem('usuarioActivo'));
  } catch (error) {
    return null;
  }
}

function actualizarUsuarioNavbar() {
  const usuario = obtenerUsuarioActivo();

  document.querySelectorAll('.navbar-links li').forEach(function (item) {
    const enlace = item.querySelector('a');
    if (!enlace) return;

    const esUsuario = enlace.querySelector('img[alt="Usuario"]') ||
      enlace.textContent.toLowerCase().includes('iniciar sesion') ||
      (enlace.getAttribute('href') || '').includes('auth/login.html');
    if (!esUsuario) return;

    if (usuario && usuario.nombre) {
      item.className = 'usuario-menu';
      item.innerHTML =
        '<button type="button" class="usuario-menu-boton" aria-expanded="false" aria-haspopup="menu">' +
        '<img src="https://cdn-icons-png.flaticon.com/512/1077/1077063.png" alt="" class="nav-icon usuario-icono">' +
        '<span class="nombre-usuario-navbar"></span>' +
        '<span class="usuario-flecha" aria-hidden="true">&#9662;</span>' +
        '</button>' +
        '<div class="usuario-menu-desplegable" role="menu">' +
        '<button type="button" class="cerrar-sesion-boton" role="menuitem">Cerrar sesión</button>' +
        '</div>';

      item.querySelector('.nombre-usuario-navbar').textContent = usuario.nombre;
      const boton = item.querySelector('.usuario-menu-boton');
      const menu = item.querySelector('.usuario-menu-desplegable');

      boton.addEventListener('click', function (evento) {
        evento.stopPropagation();
        const abierto = menu.classList.toggle('abierto');
        boton.setAttribute('aria-expanded', String(abierto));
      });
      item.querySelector('.cerrar-sesion-boton').addEventListener('click', function () {
        localStorage.removeItem('usuarioActivo');
        window.location.reload();
      });
    } else if (!item.classList.contains('usuario-menu')) {
      enlace.className = 'usuario-login';
      enlace.innerHTML = '<img src="https://cdn-icons-png.flaticon.com/512/1077/1077063.png" alt="Usuario" class="nav-icon usuario-icono"> Iniciar sesión';
      enlace.href = URL_LOGIN;
    }
  });
}

function requiereInicioSesion() {
  if (obtenerUsuarioActivo()) {
    return false;
  }
  sessionStorage.setItem('volverDespuesLogin', window.location.href);

  const modal = document.getElementById('modal-login-compra');
  if (modal && window.bootstrap) {
    bootstrap.Modal.getOrCreateInstance(modal).show();
  } else {
    window.location.href = URL_LOGIN;
  }
  return true;
}

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
  abrirMiniCarrito();
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
  const datosProducto = tarjeta.closest('.producto') || tarjeta;
  const elementoNombre = tarjeta.querySelector('.product-name, .new-name, .nombre-producto, .producto-nombre');
  const elementoPrecio = tarjeta.querySelector('.product-price, .new-price, .precio-producto, .producto-precio');
  const imagen = tarjeta.querySelector('img');

  const nombre = (datosProducto.dataset.nombre || (elementoNombre ? elementoNombre.textContent : '')).trim();
  const textoPrecio = datosProducto.dataset.precio || (elementoPrecio ? elementoPrecio.textContent : '');
  const precio = parseInt(String(textoPrecio).replace(/\D/g, ''), 10);

  return {
    id: datosProducto.dataset.id || crearId(nombre),
    nombre: nombre,
    precio: precio,
    imagen: imagen ? imagen.src : ''
  };
}

// ---------- carrito flotante ----------
const URL_PAGINA_CARRITO = new URL('../../pages/shop/carrito.html', document.currentScript.src).href;

function montarCarritoFlotante() {
  if (document.getElementById('carrito-flotante')) {
    return;
  }

  const contenedor = document.createElement('div');
  const enlace = document.createElement('a');
  const imagen = document.createElement('img');
  const contador = document.createElement('span');
  const panel = document.createElement('div');

  contenedor.id = 'carrito-flotante';
  enlace.className = 'cart-link';
  enlace.href = URL_PAGINA_CARRITO;
  enlace.setAttribute('aria-label', 'Abrir carrito de compras');
  enlace.setAttribute('aria-expanded', 'false');
  imagen.className = 'nav-icon';
  imagen.src = 'https://cdn-icons-png.flaticon.com/512/1170/1170678.png';
  imagen.alt = '';
  contador.className = 'cart-count';
  contador.textContent = '0';
  contador.hidden = true;
  enlace.append(imagen, contador);

  panel.id = 'mini-carrito-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Carrito de compras');
  panel.innerHTML =
    '<h6>Tu carrito</h6>' +
    '<div id="mini-lista"></div>' +
    '<div class="mini-total-fila"><span>Total</span><span id="mini-total">$0</span></div>' +
    '<a class="mini-ver" href="' + URL_PAGINA_CARRITO + '">Ver carrito</a>';

  contenedor.append(enlace, panel);
  document.body.appendChild(contenedor);
  enlace.setAttribute('aria-controls', panel.id);

  enlace.addEventListener('click', function (evento) {
    evento.preventDefault();
    const abierto = panel.classList.toggle('abierto');
    enlace.setAttribute('aria-expanded', String(abierto));
  });

  document.addEventListener('click', function (evento) {
    if (!evento.composedPath().includes(contenedor)) {
      panel.classList.remove('abierto');
      enlace.setAttribute('aria-expanded', 'false');
    }
  });
}

// Abre el desplegable al agregar un producto.
function abrirMiniCarrito() {
  const panel = document.getElementById('mini-carrito-panel');
  if (panel) {
    panel.classList.add('abierto');
    const enlace = document.querySelector('#carrito-flotante .cart-link');
    if (enlace) {
      enlace.setAttribute('aria-expanded', 'true');
    }
  }
}

// ---------- dibujar la vista ----------

function dibujarMiniCarrito() {
  montarCarritoFlotante();
  const carrito = obtenerCarrito();

  const unidades = contarUnidades(carrito);
  document.querySelectorAll('.cart-count, #contador-carrito').forEach(function (contador) {
    contador.textContent = unidades;
    contador.hidden = unidades === 0;
  });

  const lista = document.getElementById('mini-lista');
  const total = document.getElementById('mini-total');
  if (!lista) {
    return;
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
        '<div class="mini-cantidad">' +
          '<button type="button" data-accion="menos" data-id="' + producto.id + '" aria-label="Disminuir cantidad">&minus;</button>' +
          '<span>' + producto.cantidad + '</span>' +
          '<button type="button" data-accion="mas" data-id="' + producto.id + '" aria-label="Aumentar cantidad">+</button>' +
        '</div>' +
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
    const tarjeta = botonAgregar.closest('.tarjeta-producto, .producto, .product-card, .new-card');
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
      if (requiereInicioSesion()) {
        return;
      }
      guardarCarrito([]);
      actualizarVista();
      mostrarAlerta('success', '¡Gracias por tu compra! Tu pedido quedó registrado.');
    });
  }

  actualizarUsuarioNavbar();
  actualizarVista();

  const contenedorNavbar = document.getElementById('navbar-container');
  if (contenedorNavbar) {
    new MutationObserver(actualizarUsuarioNavbar).observe(contenedorNavbar, { childList: true });
  }
});

// si abren el carrito en otra pestaña, se mantiene sincronizado
window.addEventListener('storage', function (evento) {
  if (evento.key === 'usuarioActivo') {
    actualizarUsuarioNavbar();
  }
  actualizarVista();
});

document.addEventListener('click', function (evento) {
  document.querySelectorAll('.usuario-menu').forEach(function (item) {
    if (!item.contains(evento.target)) {
      item.querySelector('.usuario-menu-desplegable').classList.remove('abierto');
      item.querySelector('.usuario-menu-boton').setAttribute('aria-expanded', 'false');
    }
  });
});
