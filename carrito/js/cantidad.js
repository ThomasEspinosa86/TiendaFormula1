// cantidad.js
// Lógica de sumar y restar cantidades
// Usa las funciones obtenerCarrito, guardarCarrito, actualizarVista y mostrarAlerta de carrito.js

function aumentarCantidad(id) {
  const carrito = obtenerCarrito();
  const producto = carrito.find(function (item) {
    return item.id === id;
  });
  if (!producto) {
    return;
  }

  if (producto.cantidad >= MAX_CANTIDAD) {
    mostrarAlerta('warning', 'Solo puedes llevar ' + MAX_CANTIDAD + ' unidades de este producto.');
    return;
  }

  producto.cantidad++;
  guardarCarrito(carrito);
  actualizarVista();
}

function disminuirCantidad(id) {
  const carrito = obtenerCarrito();
  const producto = carrito.find(function (item) {
    return item.id === id;
  });
  if (!producto) {
    return;
  }

  if (producto.cantidad <= 1) {
    mostrarAlerta('warning', 'La cantidad mínima es 1. Si ya no lo quieres, usa el botón Eliminar.');
    return;
  }

  producto.cantidad--;
  guardarCarrito(carrito);
  actualizarVista();
}

// Cuando escriben la cantidad directamente en el input
function actualizarCantidadManual(id, valor) {
  const nuevaCantidad = parseInt(valor, 10);

  if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
    mostrarAlerta('danger', 'La cantidad no puede estar vacía ni ser negativa o cero.');
    actualizarVista(); // vuelve a mostrar el valor anterior
    return;
  }

  if (nuevaCantidad > MAX_CANTIDAD) {
    mostrarAlerta('warning', 'El máximo por producto es ' + MAX_CANTIDAD + ' unidades.');
    actualizarVista();
    return;
  }

  const carrito = obtenerCarrito();
  const producto = carrito.find(function (item) {
    return item.id === id;
  });
  if (!producto) {
    return;
  }

  producto.cantidad = nuevaCantidad;
  guardarCarrito(carrito);
  actualizarVista();
}
