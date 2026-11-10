const claveProductos = 'zonaDRSProductos';
const formulario = document.getElementById('form-producto');
const listaProductos = document.getElementById('lista-productos');
const estadoLista = document.getElementById('estado-lista');
const contadorProductos = document.getElementById('contador-productos');
const mensajeFormulario = document.getElementById('mensaje-formulario');
const entradaImagen = document.getElementById('imagen');
const vistaPrevia = document.getElementById('vista-previa');
const buscador = document.getElementById('buscador');
const botonGuardar = document.getElementById('btn-guardar');
const botonCancelar = document.getElementById('btn-cancelar');
const tituloFormulario = document.getElementById('titulo-formulario');
let productos = cargarProductos();
let productoEditando = null;

function cargarProductos() {
    try {
        const guardados = localStorage.getItem(claveProductos);
        const resultado = guardados ? JSON.parse(guardados) : [];

        if (!Array.isArray(resultado)) {
            throw new Error('El formato guardado no es válido.');
        }

        return resultado;
    } catch (error) {
        mostrarMensaje(`No se pudieron leer los productos guardados: ${error.message}`, true);
        return [];
    }
}

function guardarProductos(productosActualizados) {
    try {
        localStorage.setItem(claveProductos, JSON.stringify(productosActualizados));
        productos = productosActualizados;
        return true;
    } catch (error) {
        mostrarMensaje(`No se pudo guardar el producto. Libera espacio del navegador e intenta de nuevo. ${error.message}`, true);
        return false;
    }
}

function mostrarMensaje(texto, esError = false) {
    mensajeFormulario.textContent = texto;
    mensajeFormulario.classList.toggle('mensaje-error', esError);
}

function crearCelda(texto, clase) {
    const celda = document.createElement('td');
    celda.textContent = texto;

    if (clase) {
        celda.className = clase;
    }

    return celda;
}

function renderizarProductos() {
    const consulta = buscador.value.trim().toLocaleLowerCase();
    const filtrados = productos.filter((producto) =>
        `${producto.nombre} ${producto.codigo} ${producto.categoria}`.toLocaleLowerCase().includes(consulta)
    );

    listaProductos.replaceChildren();
    contadorProductos.textContent = `${productos.length} PRODUCTOS REGISTRADOS`;
    estadoLista.hidden = filtrados.length > 0;
    estadoLista.textContent = productos.length === 0
        ? 'Todavía no hay productos. Agrega el primero con el formulario.'
        : 'No se encontraron productos con esa búsqueda.';

    filtrados.forEach((producto) => {
        const fila = document.createElement('tr');
        const celdaProducto = document.createElement('td');
        const imagen = document.createElement('img');
        const informacion = document.createElement('div');
        const nombre = document.createElement('span');
        const codigo = document.createElement('span');
        const celdaStock = document.createElement('td');
        const stock = document.createElement('span');
        const celdaAcciones = document.createElement('td');
        const botonEditar = document.createElement('button');
        const botonEliminar = document.createElement('button');

        celdaProducto.className = 'col-producto';
        imagen.className = 'img-producto';
        imagen.alt = producto.nombre;
        imagen.src = producto.imagen || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect width="50" height="50" fill="%23eaeaea"/%3E%3C/svg%3E';
        informacion.className = 'info-prod';
        nombre.className = 'nombre-prod';
        nombre.textContent = producto.nombre;
        codigo.className = 'sku-prod';
        codigo.textContent = producto.codigo;
        informacion.append(nombre, codigo);
        celdaProducto.append(imagen, informacion);
        fila.append(celdaProducto, crearCelda(producto.categoria, 'categoria-prod'));
        fila.append(crearCelda(new Intl.NumberFormat('es-CO').format(producto.precio) + ' COP', 'precio-prod'));

        stock.className = Number(producto.stock) <= 5 ? 'badge-stock stock-bajo' : 'badge-stock stock-ok';
        stock.textContent = producto.stock;
        celdaStock.append(stock);
        fila.append(celdaStock, crearCelda(producto.estado.toUpperCase(), 'estado-prod'));

        celdaAcciones.className = 'acciones';
        botonEditar.type = 'button';
        botonEditar.className = 'btn-accion btn-editar';
        botonEditar.title = 'Editar';
        botonEditar.setAttribute('aria-label', `Editar ${producto.nombre}`);
        botonEditar.dataset.accion = 'editar';
        botonEditar.dataset.id = producto.id;
        botonEditar.textContent = '✏️';
        botonEliminar.type = 'button';
        botonEliminar.className = 'btn-accion btn-eliminar';
        botonEliminar.title = 'Eliminar';
        botonEliminar.setAttribute('aria-label', `Eliminar ${producto.nombre}`);
        botonEliminar.dataset.accion = 'eliminar';
        botonEliminar.dataset.id = producto.id;
        botonEliminar.textContent = '🗑️';
        celdaAcciones.append(botonEditar, botonEliminar);
        fila.append(celdaAcciones);
        listaProductos.append(fila);
    });
}

function leerImagen(archivo) {
    return new Promise((resolve, reject) => {
        if (!archivo.type.startsWith('image/')) {
            reject(new Error('Selecciona un archivo de imagen válido.'));
            return;
        }

        if (archivo.size > 1.5 * 1024 * 1024) {
            reject(new Error('La imagen debe pesar menos de 1.5 MB para guardarse en el navegador.'));
            return;
        }

        const lector = new FileReader();
        lector.addEventListener('load', () => resolve(lector.result));
        lector.addEventListener('error', () => reject(new Error('No se pudo leer la imagen seleccionada.')));
        lector.readAsDataURL(archivo);
    });
}

function limpiarFormulario() {
    formulario.reset();
    productoEditando = null;
    vistaPrevia.removeAttribute('src');
    vistaPrevia.hidden = true;
    tituloFormulario.textContent = 'AÑADIR PRODUCTO';
    botonGuardar.innerHTML = 'GUARDAR PRODUCTO <span>&rarr;</span>';
    botonCancelar.hidden = true;
    mostrarMensaje('');
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mostrarMensaje('');

    const archivo = entradaImagen.files[0];
    let imagen = productoEditando ? productoEditando.imagen : '';

    try {
        if (archivo) {
            imagen = await leerImagen(archivo);
        }

        const datos = new FormData(formulario);
        const codigo = datos.get('codigo').trim();
        const duplicado = productos.some((producto) =>
            producto.codigo.toLocaleLowerCase() === codigo.toLocaleLowerCase()
            && producto.id !== (productoEditando && productoEditando.id)
        );

        if (duplicado) {
            mostrarMensaje('Ya existe un producto con ese código.', true);
            return;
        }

        const producto = {
            id: productoEditando ? productoEditando.id : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            nombre: datos.get('nombre').trim(),
            codigo,
            categoria: datos.get('categoria').trim(),
            equipo: datos.get('equipo'),
            precio: Number(datos.get('precio')),
            stock: Number(datos.get('stock')),
            etiqueta: datos.get('etiqueta').trim(),
            estado: datos.get('estado'),
            imagen
        };
        const productosActualizados = productoEditando
            ? productos.map((actual) => actual.id === producto.id ? producto : actual)
            : [...productos, producto];

        if (guardarProductos(productosActualizados)) {
            limpiarFormulario();
            renderizarProductos();
        }
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
});

entradaImagen.addEventListener('change', () => {
    const archivo = entradaImagen.files[0];

    if (!archivo) {
        vistaPrevia.hidden = !productoEditando || !productoEditando.imagen;
        vistaPrevia.src = productoEditando ? productoEditando.imagen : '';
        return;
    }

    if (!archivo.type.startsWith('image/')) {
        mostrarMensaje('Selecciona un archivo de imagen válido.', true);
        entradaImagen.value = '';
        return;
    }

    if (archivo.size > 1.5 * 1024 * 1024) {
        mostrarMensaje('La imagen debe pesar menos de 1.5 MB para guardarse en el navegador.', true);
        entradaImagen.value = '';
        return;
    }

    vistaPrevia.src = URL.createObjectURL(archivo);
    vistaPrevia.hidden = false;
    mostrarMensaje('');
});

listaProductos.addEventListener('click', (evento) => {
    const boton = evento.target.closest('button[data-accion]');

    if (!boton) {
        return;
    }

    const producto = productos.find((actual) => actual.id === boton.dataset.id);

    if (!producto) {
        return;
    }

    if (boton.dataset.accion === 'eliminar') {
        if (confirm(`¿Quieres eliminar "${producto.nombre}"?`) && guardarProductos(productos.filter((actual) => actual.id !== producto.id))) {
            renderizarProductos();
        }
        return;
    }

    productoEditando = producto;
    formulario.elements.nombre.value = producto.nombre;
    formulario.elements.codigo.value = producto.codigo;
    const selectorCategoria = formulario.elements.categoria;
    if (!Array.from(selectorCategoria.options).some((opcion) => opcion.value === producto.categoria)) {
        const opcion = document.createElement('option');
        opcion.value = producto.categoria;
        opcion.textContent = producto.categoria;
        selectorCategoria.append(opcion);
    }
    selectorCategoria.value = producto.categoria;
    formulario.elements.equipo.value = producto.equipo || '';
    formulario.elements.precio.value = producto.precio;
    formulario.elements.stock.value = producto.stock;
    formulario.elements.etiqueta.value = producto.etiqueta;
    formulario.elements.estado.value = producto.estado;
    entradaImagen.value = '';
    vistaPrevia.src = producto.imagen || '';
    vistaPrevia.hidden = !producto.imagen;
    tituloFormulario.textContent = 'EDITAR PRODUCTO';
    botonGuardar.innerHTML = 'GUARDAR CAMBIOS <span>&rarr;</span>';
    botonCancelar.hidden = false;
    mostrarMensaje('');
    formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

botonCancelar.addEventListener('click', limpiarFormulario);
buscador.addEventListener('input', renderizarProductos);

renderizarProductos();
