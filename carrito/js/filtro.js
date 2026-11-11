// Filtro del catálogo: por categoría, por búsqueda y por precio.

const botonesFiltro = document.querySelectorAll('.btn-filtro');
const buscador = document.getElementById('buscador');
const selectorOrden = document.getElementById('orden');
const contenedorProductos = document.getElementById('productos');
const mensajeSinResultados = document.getElementById('sin-resultados');
const textoCantidad = document.getElementById('cantidad-resultados');

let categoriaActual = 'todos';

if (contenedorProductos) {
  const tarjetas = Array.from(contenedorProductos.querySelectorAll('.tarjeta-producto'));

  // guardamos el orden original para poder volver a él
  tarjetas.forEach(function (tarjeta, posicion) {
    tarjeta.dataset.posicion = posicion;
  });

  function aplicarFiltros() {
    const texto = buscador.value.toLowerCase().trim();
    let visibles = 0;

    tarjetas.forEach(function (tarjeta) {
      const coincideCategoria = categoriaActual === 'todos' || tarjeta.dataset.categoria === categoriaActual;
      const coincideTexto = tarjeta.dataset.nombre.toLowerCase().includes(texto);
      const columna = tarjeta.closest('.col');

      if (coincideCategoria && coincideTexto) {
        columna.classList.remove('d-none');
        visibles++;
      } else {
        columna.classList.add('d-none');
      }
    });

    ordenarProductos();

    mensajeSinResultados.classList.toggle('d-none', visibles > 0);
    textoCantidad.textContent = visibles + (visibles === 1 ? ' producto' : ' productos');
  }

  function ordenarProductos() {
    const criterio = selectorOrden.value;
    const ordenadas = tarjetas.slice();

    if (criterio === 'menor') {
      ordenadas.sort(function (a, b) {
        return a.dataset.precio - b.dataset.precio;
      });
    } else if (criterio === 'mayor') {
      ordenadas.sort(function (a, b) {
        return b.dataset.precio - a.dataset.precio;
      });
    } else {
      ordenadas.sort(function (a, b) {
        return a.dataset.posicion - b.dataset.posicion;
      });
    }

    ordenadas.forEach(function (tarjeta) {
      contenedorProductos.appendChild(tarjeta.closest('.col'));
    });
  }

  function seleccionarCategoria(categoria) {
    categoriaActual = categoria;
    botonesFiltro.forEach(function (boton) {
      boton.classList.toggle('activo', boton.dataset.categoria === categoria);
    });
    aplicarFiltros();
  }

  botonesFiltro.forEach(function (boton) {
    boton.addEventListener('click', function () {
      seleccionarCategoria(boton.dataset.categoria);
    });
  });

  buscador.addEventListener('input', aplicarFiltros);
  selectorOrden.addEventListener('change', aplicarFiltros);

  // si llegan desde el menú Productos (catalogo-carrito.html?categoria=gorras)
  const parametros = new URLSearchParams(window.location.search);
  const categoriaUrl = parametros.get('categoria');
  const categoriasValidas = ['todos', 'gorras', 'camisetas'];

  if (categoriaUrl && categoriasValidas.includes(categoriaUrl)) {
    seleccionarCategoria(categoriaUrl);
  } else {
    seleccionarCategoria('todos');
  }
}
