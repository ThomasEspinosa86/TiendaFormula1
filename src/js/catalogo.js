
(function () {
  const POR_PAGINA = 8;

  const lista = document.getElementById('listaProductos');
  const form = document.getElementById('formFiltros');
  const selectOrden = document.getElementById('ordenar');
  const contador = document.getElementById('contador');
  const paginacion = document.getElementById('paginacion');
  const sinResultados = document.getElementById('sinResultados');
  const claveProductosAdmin = 'zonaDRSProductos';

  let paginaActual = 1;

  function textoNormalizado(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase();
  }

  function slugCategoria(categoria) {
    const texto = textoNormalizado(categoria);
    if (texto.includes('camiseta') || texto.includes('polo')) return 'camisetas';
    if (texto.includes('gorra')) return 'gorras';
    if (texto.includes('chaqueta')) return 'chaquetas';
    if (texto.includes('coleccion')) return 'coleccionables';
    if (texto.includes('accesorio')) return 'accesorios';
    return texto.trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'otros';
  }

  function equipoProducto(producto) {
    const texto = textoNormalizado(producto.nombre + ' ' + producto.categoria);
    if (texto.includes('red bull')) return 'red-bull-racing';
    const equipos = ['ferrari', 'mclaren', 'mercedes', 'cadillac', 'williams'];
    return equipos.find(function (equipo) { return texto.includes(equipo); }) || '';
  }

  function cargarProductosAdmin() {
    try {
      const datos = JSON.parse(localStorage.getItem(claveProductosAdmin) || '[]');
      if (!Array.isArray(datos)) throw new Error('El formato guardado no es válido.');
      return datos;
    } catch (error) {
      console.error('No se pudieron cargar los productos del administrador:', error);
      return [];
    }
  }

  function agregarCategoriaFiltro(producto) {
    const categoria = String(producto.categoria || 'Otros');
    const valor = slugCategoria(categoria);
    const fieldset = document.getElementById('filtrosCategorias');
    const existe = Array.from(fieldset.querySelectorAll('input[name="categoria"]'))
      .some(function (input) { return input.value === valor; });
    if (existe) return;

    const contenedor = document.createElement('div');
    const input = document.createElement('input');
    const label = document.createElement('label');
    contenedor.className = 'form-check';
    contenedor.dataset.categoriaAdmin = 'true';
    input.className = 'form-check-input';
    input.type = 'checkbox';
    input.name = 'categoria';
    input.value = valor;
    input.id = 'cat-admin-' + valor;
    label.className = 'form-check-label';
    label.htmlFor = input.id;
    label.textContent = categoria;
    contenedor.append(input, label);
    fieldset.append(contenedor);
  }

  function crearCardAdmin(producto) {
    const contenedor = document.createElement('div');
    const articulo = document.createElement('article');
    const areaImagen = document.createElement('div');
    const imagen = document.createElement('img');
    const cuerpo = document.createElement('div');
    const categoria = document.createElement('small');
    const nombre = document.createElement('h2');
    const precio = document.createElement('p');
    const boton = document.createElement('button');
    const etiquetaTexto = String(producto.etiqueta || '').trim();

    contenedor.className = 'col producto';
    contenedor.dataset.nombre = producto.nombre;
    contenedor.dataset.codigo = producto.codigo;
    contenedor.dataset.categoria = slugCategoria(producto.categoria);
    contenedor.dataset.equipo = equipoProducto(producto);
    contenedor.dataset.precio = String(Number(producto.precio) || 0);
    contenedor.dataset.stock = String(Number(producto.stock) || 0);
    contenedor.dataset.etiqueta = etiquetaTexto;
    contenedor.dataset.estado = String(producto.estado || '').toLocaleLowerCase();
    contenedor.dataset.vendidos = '0';
    contenedor.dataset.creado = String(Number(producto.createdAt) || Number(String(producto.id).split('-')[0]) || 0);
    contenedor.dataset.origen = 'admin';
    articulo.className = 'card producto-card h-100';
    areaImagen.className = 'producto-img position-relative';

    if (etiquetaTexto) {
      const etiqueta = document.createElement('span');
      etiqueta.className = 'badge etiqueta position-absolute top-0 start-0 m-2';
      etiqueta.textContent = etiquetaTexto;
      areaImagen.append(etiqueta);
    }

    imagen.className = 'card-img-top';
    imagen.alt = producto.nombre;
    imagen.loading = 'lazy';
    imagen.src = producto.imagen || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"%3E%3Crect width="600" height="450" fill="%23D9D9D9"/%3E%3C/svg%3E';
    areaImagen.append(imagen);
    cuerpo.className = 'card-body d-flex flex-column';
    categoria.className = 'producto-categoria text-uppercase';
    categoria.textContent = producto.categoria || 'Otros';
    nombre.className = 'producto-nombre h6';
    nombre.textContent = producto.nombre;
    precio.className = 'producto-precio mb-3';
    precio.textContent = '$ ' + new Intl.NumberFormat('es-CO').format(Number(producto.precio) || 0);
    boton.type = 'button';
    boton.className = 'btn btn-agregar mt-auto w-100';
    boton.textContent = 'Agregar al carrito';
    cuerpo.append(categoria, nombre, precio, boton);
    articulo.append(areaImagen, cuerpo);
    contenedor.append(articulo);
    return contenedor;
  }

  function mostrarProductosAdmin() {
    obtenerProductos().filter(function (producto) {
      return producto.dataset.origen === 'admin';
    }).forEach(function (producto) {
      producto.remove();
    });

    document.querySelectorAll('[data-categoria-admin]').forEach(function (filtro) {
      filtro.remove();
    });

    cargarProductosAdmin().forEach(function (producto) {
      if (!producto || !producto.nombre || !producto.codigo) return;
      agregarCategoriaFiltro(producto);
      lista.prepend(crearCardAdmin(producto));
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
      if (criterio === 'recientes') return Number(b.dataset.creado || 0) - Number(a.dataset.creado || 0);
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

  mostrarProductosAdmin();

  window.addEventListener('storage', function (evento) {
    if (evento.key === claveProductosAdmin) {
      mostrarProductosAdmin();
      paginaActual = 1;
      mostrar();
    }
  });

  mostrar();
})();