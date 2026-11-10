
(function () {
  const POR_PAGINA = 8;

  const lista = document.getElementById('listaProductos');
  const form = document.getElementById('formFiltros');
  const selectOrden = document.getElementById('ordenar');
  const contador = document.getElementById('contador');
  const paginacion = document.getElementById('paginacion');
  const sinResultados = document.getElementById('sinResultados');

  let paginaActual = 1;

  function obtenerProductos() {
    return Array.from(lista.querySelectorAll('.producto'));
  }

  function marcados(nombre) {
    return Array.from(form.querySelectorAll('input[name="' + nombre + '"]:checked'))
      .map(function (input) { return input.value; });
  }

  function filtrar() {
    const categorias = marcados('categoria');
    const equipos = marcados('equipo');
    const minValor = document.getElementById('precioMin').value;
    const maxValor = document.getElementById('precioMax').value;
    const min = minValor === '' ? 0 : Number(minValor);
    const max = maxValor === '' ? Infinity : Number(maxValor);

    return obtenerProductos().filter(function (p) {
      const d = p.dataset;
      const precio = Number(d.precio);
      return d.estado === 'activo' &&
        (categorias.length === 0 || categorias.includes(d.categoria)) &&
        (equipos.length === 0 || equipos.includes(d.equipo)) &&
        precio >= min && precio <= max;
    });
  }

  function ordenar(productos) {
    const criterio = selectOrden.value;
    const copia = productos.slice();
    copia.sort(function (a, b) {
      if (criterio === 'menor') return Number(a.dataset.precio) - Number(b.dataset.precio);
      if (criterio === 'mayor') return Number(b.dataset.precio) - Number(a.dataset.precio);
      if (criterio === 'nombre') return a.dataset.nombre.localeCompare(b.dataset.nombre, 'es');
      return Number(b.dataset.vendidos) - Number(a.dataset.vendidos); // más vendidos
    });
    return copia;
  }

  function crearBoton(texto, pagina, deshabilitado, activo, etiqueta) {
    const li = document.createElement('li');
    li.className = 'page-item' + (deshabilitado ? ' disabled' : '') + (activo ? ' active' : '');
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'page-link';
    boton.textContent = texto;
    if (etiqueta) boton.setAttribute('aria-label', etiqueta);
    if (activo) boton.setAttribute('aria-current', 'page');
    boton.addEventListener('click', function () {
      paginaActual = pagina;
      mostrar();
    });
    li.appendChild(boton);
    return li;
  }

  function dibujarPaginacion(totalPaginas) {
    paginacion.innerHTML = '';
    if (totalPaginas <= 1) return;

    paginacion.appendChild(crearBoton('‹', paginaActual - 1, paginaActual === 1, false, 'Anterior'));
    for (let i = 1; i <= totalPaginas; i++) {
      paginacion.appendChild(crearBoton(String(i), i, false, i === paginaActual, 'Página ' + i));
    }
    paginacion.appendChild(crearBoton('›', paginaActual + 1, paginaActual === totalPaginas, false, 'Siguiente'));
  }

  function mostrar() {
    const filtrados = ordenar(filtrar());
    const total = filtrados.length;
    const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;

    const inicio = (paginaActual - 1) * POR_PAGINA;
    const visibles = filtrados.slice(inicio, inicio + POR_PAGINA);

    obtenerProductos().forEach(function (p) { p.classList.add('d-none'); });
    visibles.forEach(function (p) {
      p.classList.remove('d-none');
      lista.appendChild(p); // reordena según el criterio elegido
    });

    contador.textContent = 'Mostrando ' + visibles.length + ' de ' + total + ' productos';
    sinResultados.classList.toggle('d-none', total !== 0);
    dibujarPaginacion(totalPaginas);
  }

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    paginaActual = 1;
    mostrar();
  });

  form.addEventListener('reset', function () {
    
    setTimeout(function () {
      paginaActual = 1;
      mostrar();
    }, 0);
  });

  selectOrden.addEventListener('change', function () {
    paginaActual = 1;
    mostrar();
  });

  window.actualizarCatalogo = function () {
    paginaActual = 1;
    mostrar();
  };

  mostrar();
})();