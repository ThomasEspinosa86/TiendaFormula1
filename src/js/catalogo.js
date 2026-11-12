
(function () {
  const POR_PAGINA = 8;
  const CLAVE_PRODUCTOS = 'zonaDRSProductos';

  const lista = document.getElementById('listaProductos');
  const form = document.getElementById('formFiltros');
  const selectOrden = document.getElementById('ordenar');
  const contador = document.getElementById('contador');
  const paginacion = document.getElementById('paginacion');
  const sinResultados = document.getElementById('sinResultados');

  let paginaActual = 1;

  function agregarProductosDelAdministrador() {
    let guardados;
    try {
      guardados = localStorage.getItem(CLAVE_PRODUCTOS);
    } catch (error) {
      console.error('No se pudieron leer los productos del administrador.', error);
      return;
    }

    if (!guardados) return;

    let productos;
    try {
      productos = JSON.parse(guardados);
      if (!Array.isArray(productos)) {
        throw new Error('El formato guardado no es una lista de productos.');
      }
    } catch (error) {
      console.error('No se pudieron interpretar los productos del administrador.', error);
      return;
    }

    productos.forEach(function (producto) {
      if (!producto || typeof producto !== 'object') return;

      const nombre = String(producto.nombre || '');
      const categoria = String(producto.categoria || '').trim().toLocaleLowerCase();
      const precio = Number(producto.precio);
      const tarjeta = document.createElement('div');
      tarjeta.className = 'col producto';
      tarjeta.dataset.nombre = nombre;
      tarjeta.dataset.codigo = String(producto.codigo || '');
      tarjeta.dataset.categoria = categoria;
      tarjeta.dataset.equipo = String(producto.equipo || '');
      tarjeta.dataset.precio = String(precio);
      tarjeta.dataset.stock = String(Number(producto.stock) || 0);
      tarjeta.dataset.etiqueta = String(producto.etiqueta || '');
      tarjeta.dataset.estado = String(producto.estado || '').toLocaleLowerCase();
      tarjeta.dataset.vendidos = '0';

      const articulo = document.createElement('article');
      articulo.className = 'card producto-card h-100';
      const contenedorImagen = document.createElement('div');
      contenedorImagen.className = 'producto-img position-relative';

      if (producto.etiqueta) {
        const etiqueta = document.createElement('span');
        etiqueta.className = 'badge etiqueta position-absolute top-0 start-0 m-2';
        etiqueta.textContent = producto.etiqueta;
        contenedorImagen.appendChild(etiqueta);
      }

      const imagen = document.createElement('img');
      imagen.className = 'card-img-top';
      imagen.alt = nombre;
      imagen.loading = 'lazy';
      imagen.src = producto.imagen || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect width="50" height="50" fill="%23eaeaea"/%3E%3C/svg%3E';
      contenedorImagen.appendChild(imagen);

      const cuerpo = document.createElement('div');
      cuerpo.className = 'card-body d-flex flex-column';
      const textoCategoria = document.createElement('small');
      textoCategoria.className = 'producto-categoria text-uppercase';
      textoCategoria.textContent = categoria;
      const titulo = document.createElement('h2');
      titulo.className = 'producto-nombre h6';
      titulo.textContent = nombre;
      const textoPrecio = document.createElement('p');
      textoPrecio.className = 'producto-precio mb-3';
      textoPrecio.textContent = '$ ' + new Intl.NumberFormat('es-CO').format(precio);
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'btn btn-agregar mt-auto w-100';
      boton.textContent = 'Agregar al carrito';

      cuerpo.append(textoCategoria, titulo, textoPrecio, boton);
      articulo.append(contenedorImagen, cuerpo);
      tarjeta.appendChild(articulo);
      lista.appendChild(tarjeta);
    });
  }

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

  agregarProductosDelAdministrador();
  mostrar();
})();